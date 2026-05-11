import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../lib/theme';
import t from '../lib/i18n';
import { api, ApiError } from '../lib/api';

export default function FarmerDashboardScreen({ navigation }: any) {
  const { currentUser, listings, marketPrices, orders, language, loadListings } = useApp();
  const tr = t[language];
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [menuVisible, setMenuVisible] = React.useState<string | null>(null);

  const myListings = listings.filter(l => l.farmerId === currentUser?.id);
  const activeListings = myListings.filter(l => l.status === 'active').length;
  const totalViews = myListings.reduce((sum, l) => sum + l.views, 0);
  const totalInquiries = myListings.reduce((sum, l) => sum + l.inquiries, 0);
  
  // Filter orders for this farmer
  const myOrders = orders.filter(o => o.sellerId === currentUser?.id) || [];
  const pendingOrders = myOrders.filter(o => o.status === 'pending').length || 0;
  const newOrders = myOrders.filter(o => o.isNew).length || 0;

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
          <Text style={styles.headerTitle}>{tr.welcome}, {currentUser?.name || 'User'}!</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, currentUser?.verified ? styles.badgeVerified : styles.badgePending]}>
              <Text style={styles.badgeText}>
                {currentUser?.verified ? '✓ Verified Farmer' : '⏰ Pending'}
              </Text>
            </View>
            <Text style={styles.region}>• {currentUser?.region || 'N/A'}</Text>
          </View>
        </View>

        {/* Verification Pending Message */}
        {!currentUser?.verified && (
          <View style={styles.pendingCard}>
            <Text style={styles.pendingIcon}>⏰</Text>
            <View style={styles.pendingBody}>
              <Text style={styles.pendingTitle}>Approval pending</Text>
              <Text style={styles.pendingSub}>Your account is under review. Once verified, you'll be able to list produce.</Text>
            </View>
          </View>
        )}

        {/* Add Produce Button */}
        {currentUser?.verified && (
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('Add')}>
            <Text style={styles.addBtnText}>➕ Add New Produce</Text>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={styles.statsGrid}>
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
            <Text style={styles.statIcon}>💬</Text>
            <Text style={styles.statValue}>{totalInquiries}</Text>
            <Text style={styles.statLabel}>Inquiries</Text>
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

        {/* Recent Orders */}
        {myOrders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
                <Text style={styles.viewAll}>View All →</Text>
              </TouchableOpacity>
            </View>
            {myOrders.slice(0, 3).map(order => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetail', { order })}
              >
                {order.isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
                <View style={styles.orderHeader}>
                  <Text style={styles.orderCrop}>{order.cropName || 'Product'}</Text>
                  <View style={[
                    styles.orderStatusBadge,
                    order.status === 'pending' && styles.statusPending,
                    order.status === 'accepted' && styles.statusAccepted,
                    order.status === 'rejected' && styles.statusRejected,
                  ]}>
                    <Text style={styles.orderStatusText}>
                      {(order.status || 'pending').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.orderMeta}>
                  {order.requestedQuantity || '0'} {order.unit || 'kg'} • From {order.buyerName || 'Buyer'}
                </Text>
                {order.offeredPrice && (
                  <Text style={styles.orderPrice}>
                    Offered: ETB {order.offeredPrice.toLocaleString()}
                  </Text>
                )}
                {order.unreadCount && order.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{order.unreadCount} new</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* My Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Produce Listings</Text>
            {currentUser?.verified && (
              <TouchableOpacity onPress={() => navigation.navigate('Add')}>
                <Text style={styles.addMore}>+ Add More</Text>
              </TouchableOpacity>
            )}
          </View>
          {myListings.length > 0 ? (
            myListings.map(listing => (
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
                    <Text style={styles.listingStats}>👁️ {listing.views || 0} • 💬 {listing.inquiries || 0}</Text>
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
              <Text style={styles.emptyTitle}>No Listings Yet</Text>
              <Text style={styles.emptySub}>Start selling by adding your first produce listing</Text>
              {currentUser?.verified && (
                <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Add')}>
                  <Text style={styles.emptyBtnText}>Add Produce</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Market Prices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Prices Today</Text>
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
  pendingCard: { margin: 16, backgroundColor: '#fef3c7', borderRadius: 12, padding: 16, flexDirection: 'row', gap: 12, borderWidth: 2, borderColor: '#fbbf24' },
  pendingIcon: { fontSize: 32 },
  pendingBody: { flex: 1 },
  pendingTitle: { fontSize: 16, fontWeight: '700', color: '#78350f', marginBottom: 4 },
  pendingSub: { fontSize: 13, color: '#92400e', lineHeight: 18 },
  addBtn: { margin: 16, backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', padding: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.foreground },
  statLabel: { fontSize: 11, color: colors.mutedForeground, marginTop: 4, textAlign: 'center' },
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
  pricesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  priceCard: { width: '48%', backgroundColor: colors.card, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: colors.border },
  priceCrop: { fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 6 },
  priceValue: { fontSize: 20, fontWeight: '700', color: colors.primary },
  priceUnit: { fontSize: 11, color: colors.mutedForeground },
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
  viewAll: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderCrop: { fontSize: 15, fontWeight: '700', color: colors.foreground, flex: 1 },
  orderStatusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPending: { backgroundColor: '#fef3c7' },
  statusAccepted: { backgroundColor: '#dcfce7' },
  statusRejected: { backgroundColor: '#fee2e2' },
  orderStatusText: { fontSize: 10, fontWeight: '700', color: '#374151' },
  orderMeta: { fontSize: 12, color: colors.mutedForeground, marginBottom: 4 },
  orderPrice: { fontSize: 14, fontWeight: '600', color: colors.primary },
  unreadBadge: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
