import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { colors } from '../lib/theme';
import { api, ApiError } from '../lib/api';

interface User {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  region?: string;
  verificationStatus: string;
  roles: string[];
}

export default function AdminVerificationsScreen({ navigation }: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.users.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      if (error instanceof ApiError) {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      await api.users.updateVerification(userId, 'verified');
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, verificationStatus: 'verified' } : u
      ));
      Alert.alert('Success', 'User approved successfully');
    } catch (error) {
      console.error('Failed to approve user:', error);
      Alert.alert('Error', 'Failed to approve user');
    }
  };

  const handleReject = async (userId: number) => {
    Alert.alert(
      'Confirm Rejection',
      'Are you sure you want to reject this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.users.deleteUser(userId);
              setUsers(prev => prev.filter(u => u.id !== userId));
              Alert.alert('Success', 'User rejected');
            } catch (error) {
              Alert.alert('Error', 'Failed to reject user');
            }
          }
        }
      ]
    );
  };

  const pendingUsers = users.filter(u => u.verificationStatus === 'unverified');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pending Verifications</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{pendingUsers.length}</Text>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} />
        }
      >
        {pendingUsers.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Name</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Role</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Region</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Actions</Text>
            </View>
            {pendingUsers.map(user => (
              <View key={user.id} style={styles.tableRow}>
                <View style={[styles.tableCell, { flex: 2 }]}>
                  <Text style={styles.tableCellText}>{user.fullName}</Text>
                  <Text style={styles.tableCellSubtext}>{user.phone}</Text>
                </View>
                <View style={[styles.tableCell, { flex: 1 }]}>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{user.roles[0] || 'user'}</Text>
                  </View>
                </View>
                <View style={[styles.tableCell, { flex: 1.5 }]}>
                  <Text style={styles.tableCellText}>{user.region || 'N/A'}</Text>
                </View>
                <View style={[styles.tableCell, { flex: 1 }]}>
                  <TouchableOpacity onPress={() => handleApprove(user.id)}>
                    <Text style={styles.actionIcon}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleReject(user.id)}>
                    <Text style={[styles.actionIcon, styles.actionIconDanger]}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>All Users Verified</Text>
            <Text style={styles.emptySub}>No pending verification requests</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  backButton: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: colors.foreground, flex: 1 },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  table: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.muted,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.mutedForeground,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tableCell: { justifyContent: 'center' },
  tableCellText: { fontSize: 13, color: colors.foreground, fontWeight: '500' },
  tableCellSubtext: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  roleBadge: { backgroundColor: colors.muted, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  roleBadgeText: { fontSize: 10, fontWeight: '600', color: colors.foreground, textTransform: 'capitalize' },
  actionIcon: { fontSize: 18, marginBottom: 4 },
  actionIconDanger: { opacity: 0.7 },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    margin: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.3 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  emptySub: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center' },
});
