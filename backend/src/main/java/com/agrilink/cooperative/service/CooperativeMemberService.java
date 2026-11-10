package com.agrilink.cooperative.service;

import com.agrilink.cooperative.dto.AddCooperativeMemberRequest;
import com.agrilink.cooperative.dto.CooperativeMemberResponse;
import com.agrilink.cooperative.model.CooperativeMember;
import com.agrilink.cooperative.repository.CooperativeMemberRepository;
import com.agrilink.listing.model.Crop;
import com.agrilink.listing.model.ProduceListing;
import com.agrilink.listing.repository.CropRepository;
import com.agrilink.listing.repository.ProduceListingRepository;
import com.agrilink.user.model.User;
import com.agrilink.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@Transactional
public class CooperativeMemberService {

    private static final String POOL_MARKER = "[cooperative-pool]";
    private static final String DEFAULT_UNIT = "kg";

    private final CooperativeMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final ProduceListingRepository listingRepository;
    private final CropRepository cropRepository;

    public CooperativeMemberService(CooperativeMemberRepository memberRepository,
                                    UserRepository userRepository,
                                    ProduceListingRepository listingRepository,
                                    CropRepository cropRepository) {
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.cropRepository = cropRepository;
    }

    @Transactional(readOnly = true)
    public List<CooperativeMemberResponse> getMembers(Long userId) {
        requireCooperative(userId);
        return memberRepository.findByCooperativeIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public CooperativeMemberResponse addMember(Long userId, AddCooperativeMemberRequest request) {
        User cooperative = requireCooperative(userId);

        CooperativeMember member = new CooperativeMember();
        member.setCooperative(cooperative);
        member.setFullName(request.fullName().trim());
        member.setPhone(request.phone().trim());
        member.setCropName(request.cropName().trim());
        member.setQuantity(request.quantity());
        member.setUnit(normalizeUnit(request.unit()));
        member.setPricePerUnit(request.pricePerUnit());

        CooperativeMember saved = memberRepository.save(member);
        memberRepository.flush();

        repool(cooperative);
        return toResponse(saved);
    }

    public void removeMember(Long userId, Long memberId) {
        User cooperative = requireCooperative(userId);

        CooperativeMember member = memberRepository.findByIdAndCooperativeId(memberId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Member contribution not found"));

        memberRepository.delete(member);
        memberRepository.flush();

        repool(cooperative);
    }

    /**
     * Rebuilds one pooled bulk listing per crop/unit from all member contributions.
     * Existing pooled listings for groups that no longer have members are removed,
     * so manually created listings owned by the cooperative are never touched.
     */
    private void repool(User cooperative) {
        List<CooperativeMember> members =
                memberRepository.findByCooperativeIdOrderByCreatedAtDesc(cooperative.getId());

        Map<String, List<CooperativeMember>> groups = new LinkedHashMap<>();
        for (CooperativeMember member : members) {
            String key = member.getCropName().trim().toLowerCase(Locale.ROOT)
                    + "|" + normalizeUnit(member.getUnit()).toLowerCase(Locale.ROOT);
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(member);
        }

        List<ProduceListing> existingPooled = listingRepository.findBySellerId(cooperative.getId()).stream()
                .filter(this::isPooledListing)
                .toList();

        Set<Long> keptListingIds = new HashSet<>();

        for (List<CooperativeMember> group : groups.values()) {
            CooperativeMember sample = group.get(0);
            String cropName = sample.getCropName().trim();
            String unit = normalizeUnit(sample.getUnit());

            BigDecimal totalQuantity = BigDecimal.ZERO;
            BigDecimal totalValue = BigDecimal.ZERO;
            for (CooperativeMember member : group) {
                totalQuantity = totalQuantity.add(member.getQuantity());
                totalValue = totalValue.add(member.getQuantity().multiply(member.getPricePerUnit()));
            }

            BigDecimal pooledPrice = totalQuantity.signum() > 0
                    ? totalValue.divide(totalQuantity, 2, RoundingMode.HALF_UP)
                    : sample.getPricePerUnit();

            Crop crop = cropRepository.findByCropNameIgnoreCase(cropName)
                    .orElseGet(() -> {
                        Crop newCrop = new Crop();
                        newCrop.setCropName(cropName);
                        return cropRepository.save(newCrop);
                    });

            ProduceListing listing = existingPooled.stream()
                    .filter(l -> l.getCrop() != null
                            && l.getCrop().getCropName().equalsIgnoreCase(cropName)
                            && unit.equalsIgnoreCase(normalizeUnit(l.getUnit())))
                    .findFirst()
                    .orElseGet(() -> {
                        ProduceListing created = new ProduceListing();
                        created.setSeller(cooperative);
                        return created;
                    });

            listing.setCrop(crop);
            listing.setAskingPrice(pooledPrice);
            listing.setQuantity(totalQuantity.stripTrailingZeros().toPlainString());
            listing.setUnit(unit);
            listing.setLocation(cooperative.getRegion());
            listing.setDescription(POOL_MARKER + " Pooled bulk listing from "
                    + group.size() + " member contribution" + (group.size() == 1 ? "" : "s")
                    + ". Updated automatically as members are added or removed.");

            ProduceListing saved = listingRepository.save(listing);
            keptListingIds.add(saved.getId());
        }

        existingPooled.stream()
                .filter(l -> !keptListingIds.contains(l.getId()))
                .forEach(listingRepository::delete);
    }

    private boolean isPooledListing(ProduceListing listing) {
        return listing.getDescription() != null && listing.getDescription().startsWith(POOL_MARKER);
    }

    private String normalizeUnit(String unit) {
        return StringUtils.hasText(unit) ? unit.trim() : DEFAULT_UNIT;
    }

    private User requireCooperative(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean isCooperative = user.getRoles().stream()
                .anyMatch(role -> "cooperative".equalsIgnoreCase(role.getUserName()));

        if (!isCooperative) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only cooperative accounts can manage pooled members");
        }

        return user;
    }

    private CooperativeMemberResponse toResponse(CooperativeMember member) {
        return new CooperativeMemberResponse(
                member.getId(),
                member.getFullName(),
                member.getPhone(),
                member.getCropName(),
                member.getQuantity(),
                member.getUnit(),
                member.getPricePerUnit(),
                member.getCreatedAt());
    }
}
