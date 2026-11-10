package com.agrilink.cooperative.controller;

import com.agrilink.cooperative.dto.AddCooperativeMemberRequest;
import com.agrilink.cooperative.dto.CooperativeMemberResponse;
import com.agrilink.cooperative.service.CooperativeMemberService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/cooperative/members")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class CooperativeMemberController {

    private final CooperativeMemberService memberService;

    public CooperativeMemberController(CooperativeMemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    public List<CooperativeMemberResponse> list(Authentication authentication) {
        return memberService.getMembers(currentUserId(authentication));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CooperativeMemberResponse add(
            @Valid @RequestBody AddCooperativeMemberRequest request,
            Authentication authentication) {
        return memberService.addMember(currentUserId(authentication), request);
    }

    @DeleteMapping("/{memberId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable Long memberId, Authentication authentication) {
        memberService.removeMember(currentUserId(authentication), memberId);
    }

    private Long currentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user id");
        }
    }
}
