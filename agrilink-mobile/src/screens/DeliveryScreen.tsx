import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { DeliveryRequest } from '../types';

const STATUS_COLORS: Record<string, string> = {
  pending: '#fef3c7',
  accepted: '#dcfce7',
  'in-transit': '#dbeafe',
  delivered: '#f0fdf4',
  rejected: '#fee2e2',
};

const STATUS_TEXT_COLORS: Record<string, string> = {
  pending: '#92400e',
  accepted: '#166534',
  'in-transit': '#1e40af',
  delivered: '#15803d',
  rejected: '#dc2626',
};

function DeliveryCard({ item, onAccept, onReject, isTransporter }: {
  item: DeliveryRequest;
  onAccept?: () => void;
  onReject?: () => void;
  isTransporter: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cargo}>{item.cargoType}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || '#f3f4f6' }]}>
          <Text style={[styles.statusText, { color: STATUS_TEXT_COLORS[item.status] || '#374151' }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.route}>📍 {item.pickupLocation} → {item.destination}</Text>
      {item.priceOffer && <Text style={styles.price}>ETB {item.priceOffer.toLocaleString()}</Text>}
      {item.weightValue && <Text style={styles.meta}>{item.weightValue} {item.weightUnit}</Text>}
      {item.notes && <Text style={styles.notes}>{item.notes}</Text>}

      {isTransporter && item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function DeliveryScreen() {
  const { deliveryRequests, currentUser, updateDeliveryStatus } = useApp();
  const isTransporter = currentUser?.role === 'transporter';

  const handleAccept = (id: string) => {
    Alert.alert('Accept', 'Accept this delivery request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: () => updateDeliveryStatus(id, 'accepted') },
    ]);
  };

  const handleReject = (id: string) => {
    Alert.alert('Reject', 'Reject this delivery request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => updateDeliveryStatus(id, 'rejected') },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deliveries</Text>
      </View>
      <FlatList
        data={deliveryRequests}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <DeliveryCard
            item={item}
            isTransporter={isTransporter}
            onAccept={() => handleAccept(item.id)}
            onReject={() => handleReject(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No delivery requests</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cargo: { fontSize: 16, fontWeight: '700', color: '#111827' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  route: { fontSize: 14, color: '#374151', marginBottom: 4 },
  price: { fontSize: 15, color: '#16a34a', fontWeight: '600', marginTop: 4 },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  notes: { fontSize: 13, color: '#9ca3af', marginTop: 4, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  acceptBtn: { flex: 1, backgroundColor: '#dcfce7', borderRadius: 8, padding: 10, alignItems: 'center' },
  acceptText: { color: '#166534', fontWeight: '600' },
  rejectBtn: { flex: 1, backgroundColor: '#fee2e2', borderRadius: 8, padding: 10, alignItems: 'center' },
  rejectText: { color: '#dc2626', fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#9ca3af', fontSize: 15 },
});
