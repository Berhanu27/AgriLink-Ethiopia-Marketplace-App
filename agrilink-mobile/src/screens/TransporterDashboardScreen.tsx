import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../lib/theme';

export default function TransporterDashboardScreen({ navigation }: any) {
  const { currentUser, deliveryRequests, updateTransporterAvailability, updateDeliveryStatus } = useApp();
  const [isOnline, setIsOnline] = React.useState(currentUser?.available ?? true);

  const handleToggleAvailability = async (value: boolean) => {
    setIsOnline(value);
    const success = await updateTransporterAvailability(value);
    if (!success) {
      // Revert on failure
      setIsOnline(!value);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    await updateDeliveryStatus(requestId, 'accepted');
  };

  const handleRejectRequest = async (requestId: string) => {
    await updateDeliveryStatus(requestId, 'rejected', 'Declined by transporter');
  };

  const pendingRequests = deliveryRequests.filter(d => d.status === 'pending').length;
  const inTransit = deliveryRequests.filter(d => d.status === 'in-transit').length;
  const completed = deliveryRequests.filter(d => d.status === 'delivered').length;
  const totalEarnings = deliveryRequests
    .filter(d => d.status === 'delivered')
    .reduce((sum, d) => sum + (d.priceOffer ?? 0), 0);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome, {currentUser?.name || 'User'}!</Text>
          <Text style={styles.headerSub}>🚚 {currentUser?.vehicleType || 'Vehicle'} • {currentUser?.vehicleCapacity || 'N/A'}</Text>
        </View>

        {/* Availability Toggle */}
        <View style={styles.availabilityCard}>
          <View style={styles.availabilityLeft}>
            <Text style={styles.availabilityTitle}>Availability Status</Text>
            <Text style={styles.availabilitySub}>
              {isOnline ? 'You are visible to customers' : 'You are offline'}
            </Text>
          </View>
          <View style={styles.availabilityRight}>
            <Text style={styles.availabilityLabel}>{isOnline ? 'Online' : 'Offline'}</Text>
            <Switch value={isOnline} onValueChange={handleToggleAvailability} />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏰</Text>
            <Text style={styles.statValue}>{pendingRequests}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🚚</Text>
            <Text style={styles.statValue}>{inTransit}</Text>
            <Text style={styles.statLabel}>In Transit</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>{completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>{totalEarnings.toLocaleString()}</Text>
            <Text style={styles.statLabel}>ETB Earned</Text>
          </View>
        </View>

        {/* Delivery Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Requests</Text>
          {deliveryRequests.length > 0 ? (
            deliveryRequests.map(request => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestCargo}>{request.cargoType}</Text>
                  <View style={[styles.statusBadge, styles[`status${request.status.replace('-', '')}`]]}>
                    <Text style={styles.statusText}>{request.status}</Text>
                  </View>
                </View>
                <Text style={styles.requestMeta}>Requested by {request.requesterName || 'N/A'}</Text>
                <View style={styles.routeInfo}>
                  <Text style={styles.routeLabel}>📍 Pickup: {request.pickupLocation}</Text>
                  <Text style={styles.routeLabel}>🎯 Destination: {request.destination}</Text>
                  {request.weightValue && (
                    <Text style={styles.routeLabel}>📦 Weight: {request.weightValue}{request.weightUnit}</Text>
                  )}
                </View>
                <Text style={styles.requestPrice}>{request.priceOffer?.toLocaleString() ?? '—'} ETB</Text>
                {request.status === 'pending' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptRequest(request.id)}>
                      <Text style={styles.acceptBtnText}>✓ Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectRequest(request.id)}>
                      <Text style={styles.rejectBtnText}>✕ Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🚚</Text>
              <Text style={styles.emptyTitle}>No Active Requests</Text>
              <Text style={styles.emptySub}>New delivery requests will appear here</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16, paddingTop: 48, backgroundColor: colors.primary },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: '#dcfce7' },
  availabilityCard: { margin: 16, backgroundColor: colors.card, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  availabilityLeft: { flex: 1 },
  availabilityTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  availabilitySub: { fontSize: 12, color: colors.mutedForeground },
  availabilityRight: { alignItems: 'flex-end', gap: 8 },
  availabilityLabel: { fontSize: 13, fontWeight: '600', color: colors.foreground },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  statCard: { width: '48%', backgroundColor: colors.card, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.foreground },
  statLabel: { fontSize: 11, color: colors.mutedForeground, marginTop: 4 },
  section: { padding: 16 },
  content: { paddingBottom: 90 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 12 },
  requestCard: { backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  requestCargo: { fontSize: 15, fontWeight: '700', color: colors.foreground },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statuspending: { backgroundColor: '#fef3c7' },
  statusaccepted: { backgroundColor: '#dbeafe' },
  statusintransit: { backgroundColor: '#e9d5ff' },
  statusdelivered: { backgroundColor: '#dcfce7' },
  statusText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  requestMeta: { fontSize: 12, color: colors.mutedForeground, marginBottom: 8 },
  routeInfo: { backgroundColor: colors.muted, borderRadius: 8, padding: 10, marginBottom: 8 },
  routeLabel: { fontSize: 12, color: colors.foreground, marginBottom: 4 },
  requestPrice: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 8 },
  acceptBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 8, padding: 12, alignItems: 'center' },
  acceptBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  rejectBtn: { flex: 1, backgroundColor: '#fee2e2', borderRadius: 8, padding: 12, alignItems: 'center' },
  rejectBtnText: { color: '#991b1b', fontSize: 14, fontWeight: '700' },
  emptyCard: { backgroundColor: colors.card, borderRadius: 12, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.3 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  emptySub: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center' },
});
