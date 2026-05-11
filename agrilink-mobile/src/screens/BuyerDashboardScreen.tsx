import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../lib/theme';
import t from '../lib/i18n';

export default function BuyerDashboardScreen({ navigation }: any) {
  const {
    currentUser,
    listings,
    transporters,
    marketPrices,
    language,
    createDeliveryRequest,
    deliveryRequests,
  } = useApp();
  const tr = t[language];
  const [searchQuery, setSearchQuery] = React.useState('');
  const [savedListings] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [requestForm, setRequestForm] = React.useState({
    transporterId: '',
    pickupLocation: '',
    destination: '',
    cargoType: '',
    weightValue: '',
    weightUnit: 'kg',
    priceOffer: '',
    preferredTime: '',
    notes: '',
  });

  const handleRequestChange = (field: keyof typeof requestForm, value: string) => {
    setRequestForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitRequest = async () => {
    if (!currentUser?.verified) {
      Alert.alert('Info', tr.unverifiedError);
      return;
    }

    if (!requestForm.transporterId || !requestForm.pickupLocation || !requestForm.destination || !requestForm.cargoType) {
      Alert.alert('Error', tr.requiredError);
      return;
    }

    const weightValue = requestForm.weightValue ? Number(requestForm.weightValue) : undefined;
    const priceOffer = requestForm.priceOffer ? Number(requestForm.priceOffer) : undefined;

    if ((requestForm.weightValue && Number.isNaN(weightValue)) || (requestForm.priceOffer && Number.isNaN(priceOffer))) {
      Alert.alert('Error', tr.requestError);
      return;
    }

    setIsSubmitting(true);
    const ok = await createDeliveryRequest({
      transporterId: requestForm.transporterId,
      pickupLocation: requestForm.pickupLocation.trim(),
      destination: requestForm.destination.trim(),
      cargoType: requestForm.cargoType.trim(),
      weightValue,
      weightUnit: requestForm.weightValue ? requestForm.weightUnit : undefined,
      preferredTime: requestForm.preferredTime || undefined,
      priceOffer,
      notes: requestForm.notes.trim() || undefined,
    });
    setIsSubmitting(false);

    if (ok) {
      Alert.alert('Success', tr.requestSuccess);
      setRequestForm({
        transporterId: '',
        pickupLocation: '',
        destination: '',
        cargoType: '',
        weightValue: '',
        weightUnit: 'kg',
        priceOffer: '',
        preferredTime: '',
        notes: '',
      });
    } else {
      Alert.alert('Error', tr.requestError);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return tr.statusPending;
      case 'accepted':
        return tr.statusAccepted;
      case 'rejected':
        return tr.statusRejected;
      case 'in-transit':
        return tr.statusInTransit;
      case 'delivered':
        return tr.statusDelivered;
      default:
        return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'accepted':
        return styles.statusAccepted;
      case 'in-transit':
        return styles.statusInTransit;
      case 'delivered':
        return styles.statusDelivered;
      case 'rejected':
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };

  const filteredListings = listings.filter(l =>
    l.status === 'active' &&
    (searchQuery === '' ||
      l.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{tr.welcome}, {currentUser?.name || 'User'}!</Text>
          <Text style={styles.headerSub}>{tr.buyerSubtitle}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, currentUser?.verified ? styles.badgeVerified : styles.badgePending]}>
              <Text style={styles.badgeText}>
                {currentUser?.verified ? `✓ ${tr.verifiedBuyer}` : `⏰ ${tr.pendingBuyer}`}
              </Text>
            </View>
            <Text style={styles.region}>• {currentUser?.region || 'N/A'}</Text>
          </View>
        </View>

        {!currentUser?.verified && (
          <View style={styles.pendingCard}>
            <Text style={styles.pendingText}>{tr.pendingNote}</Text>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={tr.searchPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statValue}>{filteredListings.length}</Text>
            <Text style={styles.statLabel}>{tr.availableLabel}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔖</Text>
            <Text style={styles.statValue}>{savedListings.length}</Text>
            <Text style={styles.statLabel}>{tr.savedLabel}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💬</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{tr.inquiriesLabel}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.postDemandBtn}>
          <Text style={styles.postDemandText}>{tr.postDemand}</Text>
        </TouchableOpacity>

        {/* Available Transporters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{tr.availableTransporters}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{transporters.length} {tr.availableLabel}</Text>
            </View>
          </View>
          {transporters.length > 0 ? (
            transporters.slice(0, 5).map(transporter => (
              <View key={transporter.id} style={styles.transporterCard}>
                <View style={styles.transporterHeader}>
                  <Text style={styles.transporterName}>{transporter.fullName}</Text>
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() => handleRequestChange('transporterId', transporter.id)}
                  >
                    <Text style={styles.selectBtnText}>{tr.selectTransporter}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.transporterMeta}>{transporter.phone}</Text>
                <Text style={styles.transporterMeta}>{transporter.region || '—'} • {transporter.vehicleType || '—'}</Text>
                <Text style={styles.transporterCapacity}>{transporter.vehicleCapacity || '—'}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{tr.noTransporters}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr.requestTitle}</Text>
          <Text style={styles.sectionSub}>{tr.requestSubtitle}</Text>
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>{tr.transporterLabel}</Text>
            <View style={styles.pillRow}>
              {transporters.slice(0, 4).map(transporter => (
                <TouchableOpacity
                  key={transporter.id}
                  style={[
                    styles.pillBtn,
                    requestForm.transporterId === transporter.id && styles.pillBtnActive,
                  ]}
                  onPress={() => handleRequestChange('transporterId', transporter.id)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      requestForm.transporterId === transporter.id && styles.pillTextActive,
                    ]}
                  >
                    {transporter.fullName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>{tr.pickupLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder={tr.pickupPlaceholder}
              value={requestForm.pickupLocation}
              onChangeText={(text) => handleRequestChange('pickupLocation', text)}
            />

            <Text style={styles.formLabel}>{tr.destinationLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder={tr.destinationPlaceholder}
              value={requestForm.destination}
              onChangeText={(text) => handleRequestChange('destination', text)}
            />

            <Text style={styles.formLabel}>{tr.cargoLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder={tr.cargoPlaceholder}
              value={requestForm.cargoType}
              onChangeText={(text) => handleRequestChange('cargoType', text)}
            />

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>{tr.weightLabel}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={tr.weightPlaceholder}
                  keyboardType="numeric"
                  value={requestForm.weightValue}
                  onChangeText={(text) => handleRequestChange('weightValue', text)}
                />
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.formLabel}>Unit</Text>
                <View style={styles.unitRow}>
                  {['kg', 'quintal', 'ton'].map(unit => (
                    <TouchableOpacity
                      key={unit}
                      style={[styles.unitBtn, requestForm.weightUnit === unit && styles.unitBtnActive]}
                      onPress={() => handleRequestChange('weightUnit', unit)}
                    >
                      <Text
                        style={[styles.unitText, requestForm.weightUnit === unit && styles.unitTextActive]}
                      >
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Text style={styles.formLabel}>{tr.priceLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder={tr.pricePlaceholder}
              keyboardType="numeric"
              value={requestForm.priceOffer}
              onChangeText={(text) => handleRequestChange('priceOffer', text)}
            />

            <Text style={styles.formLabel}>{tr.preferredLabel}</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD HH:mm"
              value={requestForm.preferredTime}
              onChangeText={(text) => handleRequestChange('preferredTime', text)}
            />

            <Text style={styles.formLabel}>{tr.notesLabel}</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder={tr.notesPlaceholder}
              value={requestForm.notes}
              onChangeText={(text) => handleRequestChange('notes', text)}
              multiline
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitRequest} disabled={isSubmitting}>
              <Text style={styles.submitBtnText}>{isSubmitting ? '...' : tr.submitRequest}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr.myRequests}</Text>
          {deliveryRequests.length > 0 ? (
            deliveryRequests.map(request => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestTitle}>{request.cargoType}</Text>
                  <View style={[styles.statusBadge, getStatusStyle(request.status)]}>
                    <Text style={styles.statusText}>{getStatusLabel(request.status)}</Text>
                  </View>
                </View>
                <Text style={styles.requestMeta}>Transporter: {request.transporterName || '—'}</Text>
                <Text style={styles.requestMeta}>Pickup: {request.pickupLocation}</Text>
                <Text style={styles.requestMeta}>Destination: {request.destination}</Text>
                {request.rejectReason ? (
                  <Text style={styles.rejectionText}>{tr.rejectionReason}: {request.rejectReason}</Text>
                ) : null}
                <Text style={styles.requestPrice}>{request.priceOffer?.toLocaleString() ?? '—'} ETB</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{tr.noRequests}</Text>
              <Text style={styles.emptySub}>{tr.noRequestsSubtitle}</Text>
            </View>
          )}
        </View>

        {/* Market Prices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{tr.marketTitle}</Text>
          <View style={styles.pricesGrid}>
            {marketPrices.slice(0, 4).map(price => (
              <View key={price.id} style={styles.priceCard}>
                <Text style={styles.priceCrop}>{price.cropName}</Text>
                <Text style={styles.priceValue}>{price.averagePrice} ETB</Text>
                <Text style={styles.priceUnit}>/{price.unit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Available Produce */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{tr.availableTitle}</Text>
            <Text style={styles.countText}>{filteredListings.length} {tr.listingsLabel}</Text>
          </View>
          {filteredListings.slice(0, 10).map(listing => (
            <TouchableOpacity
              key={listing.id}
              style={styles.listingCard}
              onPress={() => navigation.navigate('ListingDetail', { listing })}
            >
              <View style={styles.listingHeader}>
                <Text style={styles.listingCrop}>{listing.cropName}</Text>
                <Text style={styles.listingPrice}>{listing.pricePerUnit} ETB/{listing.unit}</Text>
              </View>
              <Text style={styles.listingFarmer}>{listing.farmerName}</Text>
              <Text style={styles.listingMeta}>{listing.quantity} {listing.unit} • {listing.location}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16, paddingTop: 48, backgroundColor: colors.primary },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: '#dcfce7', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  badgeVerified: { backgroundColor: '#dcfce7' },
  badgePending: { backgroundColor: 'rgba(255,255,255,0.2)' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#166534' },
  region: { fontSize: 13, color: '#dcfce7' },
  searchContainer: { padding: 16 },
  searchInput: { backgroundColor: colors.card, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: colors.border, fontSize: 14 },
  pendingCard: { marginHorizontal: 16, marginTop: 12, backgroundColor: '#fef3c7', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#fbbf24' },
  pendingText: { fontSize: 12, color: '#78350f' },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.foreground },
  statLabel: { fontSize: 11, color: colors.mutedForeground, marginTop: 4 },
  postDemandBtn: { marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  postDemandText: { color: colors.foreground, fontSize: 13, fontWeight: '600' },
  section: { padding: 16 },
  content: { paddingBottom: 90 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  sectionSub: { fontSize: 12, color: colors.mutedForeground, marginBottom: 10 },
  countBadge: { backgroundColor: colors.muted, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  countText: { fontSize: 11, color: colors.mutedForeground, fontWeight: '600' },
  transporterCard: { backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  transporterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  transporterName: { fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  transporterMeta: { fontSize: 12, color: colors.mutedForeground, marginBottom: 2 },
  transporterCapacity: { fontSize: 13, fontWeight: '600', color: colors.primary, marginTop: 4 },
  selectBtn: { backgroundColor: colors.muted, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  selectBtnText: { fontSize: 11, fontWeight: '700', color: colors.foreground },
  formCard: { backgroundColor: colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border },
  formLabel: { fontSize: 12, fontWeight: '600', color: colors.mutedForeground, marginBottom: 6 },
  input: { backgroundColor: colors.background, borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border, fontSize: 14 },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  formRow: { flexDirection: 'row', gap: 8 },
  formHalf: { flex: 1 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  pillBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.background },
  pillBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 11, color: colors.mutedForeground },
  pillTextActive: { color: '#fff', fontWeight: '700' },
  unitRow: { flexDirection: 'row', gap: 6 },
  unitBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.background },
  unitBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  unitText: { fontSize: 11, color: colors.mutedForeground, fontWeight: '600' },
  unitTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: colors.primary, borderRadius: 8, padding: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  requestCard: { backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  requestTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground },
  requestMeta: { fontSize: 12, color: colors.mutedForeground, marginBottom: 4 },
  requestPrice: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 6 },
  rejectionText: { fontSize: 12, color: '#b91c1c' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusPending: { backgroundColor: '#fef3c7' },
  statusAccepted: { backgroundColor: '#dbeafe' },
  statusRejected: { backgroundColor: '#fee2e2' },
  statusInTransit: { backgroundColor: '#e9d5ff' },
  statusDelivered: { backgroundColor: '#dcfce7' },
  pricesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  priceCard: { width: '48%', backgroundColor: colors.card, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: colors.border },
  priceCrop: { fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 6 },
  priceValue: { fontSize: 20, fontWeight: '700', color: colors.primary },
  priceUnit: { fontSize: 11, color: colors.mutedForeground },
  listingCard: { backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  listingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  listingCrop: { fontSize: 15, fontWeight: '700', color: colors.foreground },
  listingPrice: { fontSize: 15, fontWeight: '700', color: colors.primary },
  listingFarmer: { fontSize: 13, color: colors.mutedForeground, marginBottom: 4 },
  listingMeta: { fontSize: 12, color: colors.mutedForeground },
  emptyCard: { backgroundColor: colors.card, borderRadius: 10, padding: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  emptyText: { fontSize: 12, color: colors.mutedForeground },
  emptySub: { fontSize: 11, color: colors.mutedForeground, marginTop: 4 },
});
