import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';

export default function ProfileScreen({ navigation }: any) {
  const { currentUser, logout, updateTransporterAvailability } = useApp();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  if (!currentUser) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{currentUser.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{currentUser.name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{currentUser.role.toUpperCase()}</Text>
        </View>
        {currentUser.verified && (
          <Text style={styles.verified}>✓ Verified</Text>
        )}
      </View>

      <View style={styles.section}>
        <InfoRow label="Phone" value={currentUser.phone} />
        {currentUser.email && <InfoRow label="Email" value={currentUser.email} />}
        {currentUser.region && <InfoRow label="Region" value={currentUser.region} />}
        {currentUser.nationalId && <InfoRow label="National ID" value={currentUser.nationalId} />}
        {currentUser.vehicleType && <InfoRow label="Vehicle Type" value={currentUser.vehicleType} />}
        {currentUser.vehicleCapacity && <InfoRow label="Vehicle Capacity" value={currentUser.vehicleCapacity} />}
        {currentUser.cooperativeName && <InfoRow label="Cooperative" value={currentUser.cooperativeName} />}
      </View>

      {currentUser.role === 'transporter' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <TouchableOpacity
            style={[styles.availBtn, currentUser.available ? styles.availBtnOn : styles.availBtnOff]}
            onPress={() => updateTransporterAvailability(!currentUser.available)}
          >
            <Text style={styles.availBtnText}>
              {currentUser.available ? '🟢 Available' : '🔴 Unavailable'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Troubleshooting</Text>
        <TouchableOpacity
          style={styles.testBtn}
          onPress={() => navigation.navigate('ConnectionTest')}
        >
          <Text style={styles.testBtnText}>🔧 Test Backend Connection</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#16a34a', alignItems: 'center', padding: 32, paddingTop: 48 },
  content: { paddingBottom: 90 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#16a34a' },
  name: { fontSize: 20, fontWeight: '700', color: '#fff' },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 4, marginTop: 6,
  },
  roleText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  verified: { color: '#bbf7d0', fontSize: 13, marginTop: 4 },
  section: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoLabel: { color: '#6b7280', fontSize: 14 },
  infoValue: { color: '#111827', fontSize: 14, fontWeight: '500' },
  availBtn: { padding: 14, borderRadius: 10, alignItems: 'center' },
  availBtnOn: { backgroundColor: '#dcfce7' },
  availBtnOff: { backgroundColor: '#fee2e2' },
  availBtnText: { fontSize: 15, fontWeight: '600' },
  testBtn: {
    backgroundColor: '#dbeafe',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  testBtnText: {
    color: '#1e40af',
    fontSize: 15,
    fontWeight: '600',
  },
  logoutBtn: {
    margin: 16, backgroundColor: '#fee2e2', borderRadius: 10,
    padding: 16, alignItems: 'center',
  },
  logoutText: { color: '#dc2626', fontSize: 16, fontWeight: '600' },
});
