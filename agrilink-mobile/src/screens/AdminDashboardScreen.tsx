import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { colors } from '../lib/theme';
import t from '../lib/i18n';
import { api, ApiError } from '../lib/api';
import { uploadToCloudinary } from '../lib/cloudinary';
import { formatDate } from '../lib/dateUtils';

type TabType = 'verifications' | 'users' | 'listings' | 'disputes';

interface User {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  nationalId?: string;
  region?: string;
  vehicleType?: string;
  vehicleCapacity?: string;
  cooperativeName?: string;
  memberCount?: number;
  verificationStatus: string;
  roles: string[];
}

interface Broadcast {
  id: number;
  cropName: string;
  price: number;
  unit: string;
  note?: string;
  imageUrl?: string | null;
  createdAt: string;
}

export default function AdminDashboardScreen({ navigation }: any) {
  const { listings, language } = useApp();
  const tr = t[language];
  const [activeTab, setActiveTab] = useState<TabType>('verifications');
  const [users, setUsers] = useState<User[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBroadcastId, setEditingBroadcastId] = useState<number | null>(null);
  const [broadcastForm, setBroadcastForm] = useState({
    cropName: '',
    price: '',
    unit: 'kg',
    note: '',
  });
  const [broadcastImage, setBroadcastImage] = useState<{ uri: string; name?: string; type?: string } | null>(null);
  const [broadcastImagePreview, setBroadcastImagePreview] = useState<string | null>(null);

  // Fetch users and broadcasts from backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from backend
      const [usersData, broadcastsData] = await Promise.all([
        api.users.getAll(),
        api.broadcasts.getAll(),
      ]);
      
      setUsers(usersData);
      setBroadcasts(broadcastsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (error instanceof ApiError) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to load data. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditBroadcast = (broadcast: Broadcast) => {
    setEditingBroadcastId(broadcast.id);
    setBroadcastForm({
      cropName: broadcast.cropName,
      price: String(broadcast.price),
      unit: broadcast.unit || 'kg',
      note: broadcast.note || '',
    });
    setBroadcastImage(null);
    setBroadcastImagePreview(broadcast.imageUrl || null);
    // Scroll to top to show the form
    Alert.alert('Edit Mode', `Editing ${broadcast.cropName}. Update the form above and click Publish.`);
  };

  const pickBroadcastImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setBroadcastImage({
      uri: asset.uri,
      name: asset.fileName || 'broadcast.jpg',
      type: asset.mimeType || 'image/jpeg',
    });
    setBroadcastImagePreview(asset.uri);
  };

  const handlePublishBroadcast = async () => {
    if (!broadcastForm.cropName || !broadcastForm.price) {
      Alert.alert('Error', 'Please fill in crop name and price');
      return;
    }

    try {
      let imageUrl: string | undefined;
      if (broadcastImage) {
        imageUrl = await uploadToCloudinary(broadcastImage);
      }

      const broadcastData = {
        cropName: broadcastForm.cropName,
        price: parseFloat(broadcastForm.price),
        unit: broadcastForm.unit,
        note: broadcastForm.note || undefined,
        imageUrl,
      };

      if (editingBroadcastId) {
        // Update existing broadcast
        const updated = await api.broadcasts.update(editingBroadcastId, broadcastData);
        setBroadcasts(prev => prev.map(b => b.id === editingBroadcastId ? updated : b));
        Alert.alert('Success', 'Broadcast updated successfully');
      } else {
        // Create new broadcast
        const created = await api.broadcasts.create(broadcastData);
        setBroadcasts(prev => [created, ...prev]);
        Alert.alert('Success', 'Broadcast published successfully');
      }
      
      // Reset form
      setBroadcastForm({ cropName: '', price: '', unit: 'kg', note: '' });
      setEditingBroadcastId(null);
      setBroadcastImage(null);
      setBroadcastImagePreview(null);
    } catch (error) {
      console.error('Failed to publish broadcast:', error);
      if (error instanceof ApiError) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to publish broadcast. Please try again.');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingBroadcastId(null);
    setBroadcastForm({ cropName: '', price: '', unit: 'kg', note: '' });
    setBroadcastImage(null);
    setBroadcastImagePreview(null);
  };

  const handleApproveUser = async (userId: number) => {
    try {
      await api.users.updateVerification(userId, 'verified');
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, verificationStatus: 'verified' } : u
      ));
      Alert.alert('Success', 'User approved successfully');
    } catch (error) {
      console.error('Failed to approve user:', error);
      if (error instanceof ApiError) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to approve user. Please try again.');
      }
    }
  };

  const handleRejectUser = async (userId: number) => {
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
              Alert.alert('Success', 'User rejected successfully');
            } catch (error) {
              console.error('Failed to reject user:', error);
              if (error instanceof ApiError) {
                Alert.alert('Error', error.message);
              } else {
                Alert.alert('Error', 'Failed to reject user. Please try again.');
              }
            }
          }
        }
      ]
    );
  };

  const handleDeleteUser = async (userId: number) => {
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
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              console.error('Failed to delete user:', error);
              if (error instanceof ApiError) {
                Alert.alert('Error', error.message);
              } else {
                Alert.alert('Error', 'Failed to delete user. Please try again.');
              }
            }
          }
        }
      ]
    );
  };

  const handleDeleteListing = async (listingId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Extract numeric ID from listing ID (format: "listing-123" or "broadcast-123")
              const numericId = parseInt(listingId.split('-')[1]);
              await api.listings.delete(numericId);
              // Reload listings to reflect the change
              await fetchData();
              Alert.alert('Success', 'Listing deleted successfully');
            } catch (error) {
              console.error('Failed to delete listing:', error);
              if (error instanceof ApiError) {
                Alert.alert('Error', error.message);
              } else {
                Alert.alert('Error', 'Failed to delete listing. Please try again.');
              }
            }
          }
        }
      ]
    );
  };

  const handleDeleteBroadcast = async (broadcastId: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this broadcast?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.broadcasts.delete(broadcastId);
              // Reload data to reflect the change
              await fetchData();
              Alert.alert('Success', 'Broadcast deleted successfully');
            } catch (error) {
              console.error('Failed to delete broadcast:', error);
              if (error instanceof ApiError) {
                Alert.alert('Error', error.message);
              } else {
                Alert.alert('Error', 'Failed to delete broadcast. Please try again.');
              }
            }
          }
        }
      ]
    );
  };

  const adminListings = listings.filter(l => l.farmerId === 'admin');
  const farmerListings = listings.filter(l => l.farmerId !== 'admin');
  const activeListings = listings.filter(l => l.status === 'active').length;
  const pendingUsers = users.filter(u => u.verificationStatus === 'unverified');

  const stats = {
    totalUsers: users.length,
    farmers: users.filter(u => u.roles.some(r => r.toLowerCase() === 'farmer')).length,
    buyers: users.filter(u => u.roles.some(r => r.toLowerCase() === 'buyer')).length,
    transporters: users.filter(u => u.roles.some(r => r.toLowerCase() === 'transporter')).length,
    cooperatives: users.filter(u => u.roles.some(r => r.toLowerCase() === 'cooperative')).length,
    activeListings,
    pendingVerifications: pendingUsers.length,
    openDisputes: 3,
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSub}>Platform management</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statValue}>{stats.activeListings}</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏰</Text>
            <Text style={styles.statValue}>{stats.pendingVerifications}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⚠️</Text>
            <Text style={styles.statValue}>{stats.openDisputes}</Text>
            <Text style={styles.statLabel}>Disputes</Text>
          </View>
        </View>

        {/* Navigation Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('AdminVerifications')}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>⏰</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Verifications</Text>
              <Text style={styles.menuSubtitle}>Approve or reject pending users</Text>
            </View>
            {stats.pendingVerifications > 0 && (
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>{stats.pendingVerifications}</Text>
              </View>
            )}
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>👥</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Users</Text>
              <Text style={styles.menuSubtitle}>Manage all platform users</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('AdminBroadcasts')}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>📢</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Broadcasts</Text>
              <Text style={styles.menuSubtitle}>Post major crop prices</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('AdminListings')}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>📦</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Listings</Text>
              <Text style={styles.menuSubtitle}>View and manage all listings</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, styles.menuItemDisabled]}
            disabled
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>⚖️</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Disputes</Text>
              <Text style={styles.menuSubtitle}>Coming soon</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Users by Role */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Users by Role</Text>
          <View style={styles.roleStatsGrid}>
            <View style={styles.roleStatCard}>
              <Text style={styles.roleStatIcon}>🌾</Text>
              <Text style={styles.roleStatValue}>{stats.farmers}</Text>
              <Text style={styles.roleStatLabel}>Farmers</Text>
            </View>
            <View style={styles.roleStatCard}>
              <Text style={styles.roleStatIcon}>🛒</Text>
              <Text style={styles.roleStatValue}>{stats.buyers}</Text>
              <Text style={styles.roleStatLabel}>Buyers</Text>
            </View>
            <View style={styles.roleStatCard}>
              <Text style={styles.roleStatIcon}>🚚</Text>
              <Text style={styles.roleStatValue}>{stats.transporters}</Text>
              <Text style={styles.roleStatLabel}>Transporters</Text>
            </View>
            <View style={styles.roleStatCard}>
              <Text style={styles.roleStatIcon}>🤝</Text>
              <Text style={styles.roleStatValue}>{stats.cooperatives}</Text>
              <Text style={styles.roleStatLabel}>Cooperatives</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16, paddingTop: 48, backgroundColor: colors.primary },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: '#dcfce7', marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  statCard: { width: '48%', backgroundColor: colors.card, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.foreground },
  statLabel: { fontSize: 11, color: colors.mutedForeground, marginTop: 4 },
  
  // Users by Role Stats
  roleStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleStatCard: { width: '48%', backgroundColor: colors.card, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border },
  roleStatIcon: { fontSize: 28 },
  roleStatValue: { fontSize: 22, fontWeight: '700', color: colors.foreground },
  roleStatLabel: { fontSize: 10, color: colors.mutedForeground, position: 'absolute', bottom: 10, right: 12 },
  
  section: { padding: 16 },
  content: { paddingBottom: 90 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  sectionSub: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  badge: { backgroundColor: colors.muted, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, color: colors.mutedForeground, fontWeight: '600' },
  form: { backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border },
  input: { backgroundColor: colors.background, borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border, fontSize: 14 },
  unitRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  unitBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  unitBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  unitText: { fontSize: 13, color: colors.mutedForeground, fontWeight: '600' },
  unitTextActive: { color: '#fff' },
  imageButton: { backgroundColor: colors.background, borderRadius: 8, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  imageButtonText: { color: colors.foreground, fontSize: 13, fontWeight: '600' },
  imagePreview: { width: '100%', height: 160, borderRadius: 10, marginBottom: 12 },
  publishBtn: { backgroundColor: colors.primary, borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 8 },
  publishBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelBtn: { backgroundColor: colors.muted, borderRadius: 8, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  cancelBtnText: { color: colors.foreground, fontSize: 15, fontWeight: '700' },
  
  // Tabs
  tabsContainer: { paddingHorizontal: 16, marginBottom: 8 },
  tabsScroll: { flexDirection: 'row' },
  tab: { paddingHorizontal: 20, paddingVertical: 12, marginRight: 8, borderRadius: 8, backgroundColor: colors.muted },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.mutedForeground },
  tabTextActive: { color: '#fff' },
  
  // User Cards - Modern Card Format
  userCard: { 
    backgroundColor: colors.card, 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  cardBody: {
    marginBottom: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 13,
    color: colors.mutedForeground,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  
  // Broadcast Cards
  broadcastCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  broadcastImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.muted,
  },
  broadcastContent: {
    padding: 16,
  },
  broadcastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  broadcastCrop: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
    flex: 1,
  },
  broadcastPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  broadcastNote: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginBottom: 8,
    lineHeight: 18,
  },
  broadcastDate: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  
  // Listing Cards
  listingCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listingImage: {
    width: '100%',
    height: 140,
    backgroundColor: colors.muted,
  },
  listingContent: {
    padding: 16,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listingCrop: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
    flex: 1,
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  listingMeta: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  listingFarmer: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  
  // Old table styles (kept for backward compatibility)
  tableCard: { 
    backgroundColor: colors.card, 
    borderRadius: 10, 
    padding: 14, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  tableRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 24,
  },
  tableLabel: { 
    fontSize: 11, 
    color: colors.mutedForeground, 
    fontWeight: '600',
    textTransform: 'uppercase',
    width: 100,
    flexShrink: 0,
  },
  tableValue: { 
    fontSize: 13, 
    color: colors.foreground, 
    fontWeight: '600',
    flex: 1,
  },
  miniThumb: {
    width: 40,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniThumbImage: { width: 46, height: 46, borderRadius: 10 },
  miniThumbEmoji: { fontSize: 16 },
  unitBadge: { backgroundColor: colors.muted, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  unitBadgeText: { fontSize: 11, fontWeight: '600', color: colors.foreground },
  editBtn: { flex: 1, backgroundColor: '#dbeafe', borderRadius: 8, padding: 10, alignItems: 'center' },
  editBtnText: { color: '#1e40af', fontSize: 13, fontWeight: '700' },
  actionRow: { 
    flexDirection: 'row', 
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  userMetaText: { fontSize: 12, color: colors.mutedForeground },
  userPhone: { fontSize: 12, color: colors.mutedForeground, marginBottom: 8 },
  roleBadge: { backgroundColor: colors.muted, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  roleBadgeText: { fontSize: 11, fontWeight: '600', color: colors.foreground, textTransform: 'capitalize' },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statusVerified: { backgroundColor: '#dcfce7' },
  statusPending: { backgroundColor: '#fef3c7' },
  statusActive: { backgroundColor: '#dcfce7' },
  statusInactive: { backgroundColor: colors.muted },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize', color: '#374151' },
  userActions: { flexDirection: 'row', gap: 8 },
  approveBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 8, padding: 12, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  rejectBtn: { flex: 1, backgroundColor: '#fee2e2', borderRadius: 8, padding: 12, alignItems: 'center' },
  rejectBtnText: { color: '#991b1b', fontSize: 14, fontWeight: '700' },
  verifyBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 8, padding: 12, alignItems: 'center' },
  verifyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  deleteBtn: { flex: 1, backgroundColor: '#fee2e2', borderRadius: 8, padding: 12, alignItems: 'center' },
  deleteBtnText: { color: '#991b1b', fontSize: 14, fontWeight: '700' },
  
  // Table
  tableSection: { marginBottom: 16 },
  tableTitle: { fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 10, paddingHorizontal: 4 },
  tableCellLabel: { fontSize: 10, color: colors.mutedForeground, marginBottom: 2, textTransform: 'uppercase', fontWeight: '600' },
  tableCellValue: { fontSize: 13, color: colors.foreground, fontWeight: '600' },
  tableCellPrice: { fontSize: 14, color: colors.primary, fontWeight: '700' },
  
  // Empty State
  emptyCard: { backgroundColor: colors.card, borderRadius: 12, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.3 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  emptySub: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center' },
  
  // Menu Items (like sidebar navigation)
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  menuBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    minWidth: 28,
    alignItems: 'center',
  },
  menuBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  menuArrow: {
    fontSize: 24,
    color: colors.mutedForeground,
  },
  
  // Table Styles (like frontend)
  table: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 16,
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
  tableCell: {
    justifyContent: 'center',
  },
  tableCellText: {
    fontSize: 13,
    color: colors.foreground,
    fontWeight: '500',
  },
  tableCellSubtext: {
    fontSize: 11,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  tableCellPrice: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  actionIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  actionIconDanger: {
    opacity: 0.7,
  },
});
