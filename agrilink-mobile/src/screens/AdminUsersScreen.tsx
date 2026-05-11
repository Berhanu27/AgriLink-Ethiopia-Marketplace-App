import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl, Modal } from 'react-native';
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

export default function AdminUsersScreen({ navigation }: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);

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

  const handleVerify = async (userId: number) => {
    try {
      await api.users.updateVerification(userId, 'verified');
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, verificationStatus: 'verified' } : u
      ));
      Alert.alert('Success', 'User verified successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to verify user');
    }
  };

  const handleDelete = async (userId: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.users.deleteUser(userId);
              setUsers(prev => prev.filter(u => u.id !== userId));
              Alert.alert('Success', 'User deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>All Users</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{users.length}</Text>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} />
        }
      >
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Name</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Role</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Region</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}></Text>
          </View>
          {users.map(user => (
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
                <View style={[styles.statusBadge, user.verificationStatus === 'verified' ? styles.statusVerified : styles.statusPending]}>
                  <Text style={styles.statusText}>{user.verificationStatus === 'verified' ? 'Verified' : 'Pending'}</Text>
                </View>
              </View>
              <View style={[styles.tableCell, { flex: 0.5 }]}>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setMenuVisible(user.id)}
                >
                  <Text style={styles.menuIcon}>⋮</Text>
                </TouchableOpacity>
              </View>
              
              {/* Dropdown Menu */}
              {menuVisible === user.id && (
                <Modal
                  transparent
                  visible={menuVisible === user.id}
                  onRequestClose={() => setMenuVisible(null)}
                  animationType="fade"
                >
                  <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(null)}
                  >
                    <View style={styles.menuDropdown}>
                      {user.verificationStatus !== 'verified' && (
                        <>
                          <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={() => {
                              setMenuVisible(null);
                              handleVerify(user.id);
                            }}
                          >
                            <Text style={styles.menuItemIcon}>✓</Text>
                            <Text style={styles.menuItemText}>Verify</Text>
                          </TouchableOpacity>
                          <View style={styles.menuDivider} />
                        </>
                      )}
                      <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => {
                          setMenuVisible(null);
                          handleDelete(user.id);
                        }}
                      >
                        <Text style={styles.menuItemIcon}>🗑️</Text>
                        <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}
            </View>
          ))}
        </View>
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
  statusBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  statusVerified: { backgroundColor: '#dcfce7' },
  statusPending: { backgroundColor: '#fef3c7' },
  statusText: { fontSize: 10, fontWeight: '700', color: '#374151', textTransform: 'capitalize' },
  menuButton: { 
    padding: 4,
    paddingHorizontal: 8,
  },
  menuIcon: { 
    fontSize: 20, 
    color: colors.mutedForeground,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDropdown: {
    backgroundColor: colors.card,
    borderRadius: 8,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  menuItemIcon: { fontSize: 16 },
  menuItemText: { 
    fontSize: 14, 
    fontWeight: '600',
    color: colors.foreground,
  },
  menuItemTextDanger: { color: '#991b1b' },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  actionIcon: { fontSize: 18, marginBottom: 4 },
  actionIconDanger: { opacity: 0.7 },
});
