import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../lib/theme';
import { api, ApiError } from '../lib/api';

export default function CooperativeDashboardScreen({ navigation }: any) {
  const { currentUser, listings, orders, loadListings } = useApp();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [menuVisible, setMenuVisible] = React.useState<string | null>(null);

  const memberCount = currentUser?.memberCount || 0;
  const coopListings = listings.filter(l => l.farmerId === currentUser?.id);
  const activeListings = coopListings.filter(l => l.status === 'active').length;
  
  // Filter orders for this cooperative
  const myOrders = orders.filter(o => o.sellerId === currentUser?.id) || [];
  const pendingOrders = myOrders.filter(o => o.status === 'pending').length || 0;
  const newOrders = myOrders.filter(o => o.isNew).length || 0;
  
  const totalRevenue = 125000;
  const totalSold = 8;

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
            setDeletingId(listingId);
            try {
              // Extract numeric ID from listing ID (format: "listing-123")
              const numericId = parseInt(listingId.split('-')[1]);
              await api.listings.delete(numericId);
              // Reload listings
              await loadListings();
              Alert.alert('Success', 'Listing deleted successfully');
            } catch (error) {
              console.error('Failed to delete listing:', error);
              if (error instanceof ApiError) {
                Alert.alert('Error', error.message);
              } else {
                Alert.alert('Error', 'Failed to delete listing. Please try again.');
              }
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{currentUser?.cooperativeName || 'Cooperative'}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, currentUser?.verified ? styles.badgeVerified : styles.badgePending]}>
              <Text style={styles.badgeText}>
                {currentUser?.verified ? '✓ Verified Cooperative' : '⏰ Pending'}
              </Text>
            </View>
            <Text style={styles.region}>• {currentUser?.region || 'N/A'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{memberCount}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statValue}>{activeListings}</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📋</Text>
            <Text style={styles.statValue}>{pendingOrders}</Text>
            <Text style={styles.statLabel}>Pending Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>{totalRevenue.toLocaleString()}</Text>
            <Text style={styles.statLabel}>ETB Revenue</Text>
          </View>
        </View>

        {/* New Orders Alert */}
        {newOrders > 0 && (
          <TouchableOpacity 
            style={styles.newOrdersAlert}
            onPress={() => navigation.navigate('Orders')}
          >
            <Text style={styles.newOrdersIcon}>🔔</Text>
            <View style={styles.newOrdersBody}>
              <Text style={styles.newOrdersTitle}>
                {newOrders} New Order{newOrders > 1 ? 's' : ''}!
              </Text>
              <Text style={styles.newOrdersSub}>
                Tap to view and respond to buyer requests
              </Text>
            </View>
            <Text style={styles.newOrdersArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Add')}>
            <Text style={styles.actionBtnText}>➕ Create Bulk Listing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnOutline}>
            <Text style={styles.actionBtnOutlineText}>👥 Manage Members</Text>
          </TouchableOpacity>
        </View>

        {/* Bulk Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bulk Listings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Add')}>
              <Text style={styles.addMore}>+ Add More</Text>
            </TouchableOpacity>
          </View>
          {coopListings.length > 0 ? (
            coopListings.map(listing => (
              <View key={listing.id} style={styles.listingCard}>
                <View style={styles.listingHeader}>
                  <Text style={styles.listingCrop}>{listing.cropName || 'Unknown'}</Text>
                  <View style={[styles.statusBadge, listing.status === 'active' && styles.statusActive]}>
                    <Text style={styles.statusText}>{listing.status || 'unknown'}</Text>
                  </View>
                </View>
                <Text style={styles.listingMeta}>{listing.quantity || '0'} {listing.unit || 'kg'} • {listing.location || 'N/A'}</Text>
                <View style={styles.listingFooter}>
                  <Text style={styles.listingPrice}>{listing.pricePerUnit || 0} ETB/{listing.unit || 'kg'}</Text>
                  <View style={styles.listingFooterRight}>
                    <Text style={styles.listingStats}>{listing.views || 0} views • {listing.inquiries || 0} inquiries</Text>
                    {currentUser?.verified && (
                      <TouchableOpacity 
                        style={styles.menuButton}
                        onPress={() => setMenuVisible(listing.id)}
                      >
                        <Text style={styles.menuIcon}>⋮</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                
                {/* Dropdown Menu */}
                {menuVisible === listing.id && (
                  <Modal
                    transparent
                    visible={menuVisible === listing.id}
                    onRequestClose={() => setMenuVisible(null)}
                    animationType="fade"
                  >
                    <TouchableOpacity 
                      style={styles.modalOverlay}
                      activeOpacity={1}
                      onPress={() => setMenuVisible(null)}
                    >
                      <View style={styles.menuDropdown}>
                        <TouchableOpacity 
                          style={styles.menuItem}
                          onPress={() => {
                            setMenuVisible(null);
                            navigation.navigate('EditListing', { listing });
                          }}
                        >
                          <Text style={styles.menuItemIcon}>✏️</Text>
                          <Text style={styles.menuItemText}>Edit</Text>
                        </TouchableOpacity>
                        <View style={styles.menuDivider} />
                        <TouchableOpacity 
                          style={styles.menuItem}
                          onPress={() => {
                            setMenuVisible(null);
                            handleDeleteListing(listing.id);
                          }}
                          disabled={deletingId === listing.id}
                        >
                          <Text style={styles.menuItemIcon}>🗑️</Text>
                          <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </Modal>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No Bulk Listings Yet</Text>
              <Text style={styles.emptySub}>Start selling together by creating your first bulk listing</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Add')}>
                <Text style={styles.emptyBtnText}>Create Listing</Text>
              </TouchableOpacity>
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
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  badgeVerified: { backgroundColor: '#dcfce7' },
  badgePending: { backgroundColor: 'rgba(255,255,255,0.2)' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#166534' },
  region: { fontSize: 13, color: '#dcfce7' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingTop: 16, gap: 8 },
  statCard: { width: '48%', backgroundColor: colors.card, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.foreground },
  statLabel: { fontSize: 11, color: colors.mutedForeground, marginTop: 4 },
  actionsRow: { flexDirection: 'row', padding: 16, gap: 8 },
  actionBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 10, padding: 14, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  actionBtnOutline: { flex: 1, backgroundColor: colors.card, borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  actionBtnOutlineText: { color: colors.foreground, fontSize: 14, fontWeight: '700' },
  section: { padding: 16 },
  content: { paddingBottom: 90 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  addMore: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  listingCard: { backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  listingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  listingCrop: { fontSize: 15, fontWeight: '700', color: colors.foreground },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.muted },
  statusActive: { backgroundColor: '#dcfce7' },
  statusText: { fontSize: 10, fontWeight: '600', color: colors.mutedForeground, textTransform: 'capitalize' },
  listingMeta: { fontSize: 12, color: colors.mutedForeground, marginBottom: 8 },
  listingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listingPrice: { fontSize: 15, fontWeight: '700', color: colors.primary },
  listingFooterRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listingStats: { fontSize: 12, color: colors.mutedForeground },
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
  emptyCard: { backgroundColor: colors.card, borderRadius: 12, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.3 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  emptySub: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center', marginBottom: 16 },
  emptyBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  newOrdersAlert: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  newOrdersIcon: { fontSize: 32 },
  newOrdersBody: { flex: 1 },
  newOrdersTitle: { fontSize: 16, fontWeight: '700', color: '#1e40af', marginBottom: 4 },
  newOrdersSub: { fontSize: 13, color: '#1e40af' },
  newOrdersArrow: { fontSize: 24, color: '#3b82f6' },
});
