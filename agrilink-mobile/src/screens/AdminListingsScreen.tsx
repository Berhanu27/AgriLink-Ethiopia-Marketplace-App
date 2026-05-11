import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../lib/theme';
import { api } from '../lib/api';

export default function AdminListingsScreen({ navigation }: any) {
  const { listings, loadListings } = useApp();
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const handleDelete = async (listingId: string) => {
    Alert.alert('Confirm Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const numericId = parseInt(listingId.split('-')[1]);
            await api.listings.delete(numericId);
            await loadListings();
            Alert.alert('Success', 'Listing deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete listing');
          }
        }
      }
    ]);
  };

  const adminListings = listings.filter(l => l.farmerId === 'admin');
  const farmerListings = listings.filter(l => l.farmerId !== 'admin');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>All Listings</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{listings.length}</Text>
        </View>
      </View>

      <ScrollView>
        {/* Admin Listings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Products ({adminListings.length})</Text>
          {adminListings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No admin broadcasts yet</Text>
            </View>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Image</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Crop</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Price</Text>
                <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Qty</Text>
                <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}></Text>
              </View>
              {adminListings.map(item => (
                <View key={item.id} style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 0.8 }]}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.thumbnailImage} />
                    ) : (
                      <View style={styles.thumbnail}>
                        <Text style={styles.thumbnailEmoji}>🌾</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.tableCell, { flex: 1.5 }]}>
                    <Text style={styles.tableCellText}>{item.cropName || 'N/A'}</Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 1.2 }]}>
                    <Text style={styles.tableCellPrice}>{item.pricePerUnit || 0} ETB/{item.unit || 'kg'}</Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 0.8 }]}>
                    <Text style={styles.tableCellText}>{item.quantity || 'N/A'}</Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 0.5 }]}>
                    <TouchableOpacity
                      style={styles.menuButton}
                      onPress={() => setMenuVisible(item.id)}
                    >
                      <Text style={styles.menuIcon}>⋮</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Dropdown Menu */}
                  {menuVisible === item.id && (
                    <Modal
                      transparent
                      visible={menuVisible === item.id}
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
                              handleDelete(item.id);
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
          )}
        </View>

        {/* Farmer Listings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farmer Products ({farmerListings.length})</Text>
          {farmerListings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No farmer listings yet</Text>
            </View>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Image</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Crop</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Price</Text>
                <Text style={[styles.tableHeaderCell, { flex: 0.7 }]}>Qty</Text>
                <Text style={[styles.tableHeaderCell, { flex: 0.4 }]}></Text>
              </View>
              {farmerListings.map(item => (
                <View key={item.id} style={styles.tableRow}>
                  <View style={[styles.tableCell, { flex: 0.8 }]}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.thumbnailImage} />
                    ) : (
                      <View style={styles.thumbnail}>
                        <Text style={styles.thumbnailEmoji}>🌾</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.tableCell, { flex: 1.2 }]}>
                    <Text style={styles.tableCellText} numberOfLines={2}>{item.cropName || 'N/A'}</Text>
                    <Text style={styles.tableCellSubtext} numberOfLines={1}>{item.farmerName || ''}</Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 1.2 }]}>
                    <Text style={styles.tableCellPrice} numberOfLines={1}>{item.pricePerUnit || 0} ETB/{item.unit || 'kg'}</Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 0.7 }]}>
                    <Text style={styles.tableCellText} numberOfLines={1}>{item.quantity || 'N/A'}</Text>
                  </View>
                  <View style={[styles.tableCell, { flex: 0.4, alignItems: 'flex-end' }]}>
                    <TouchableOpacity
                      style={styles.menuButton}
                      onPress={() => setMenuVisible(item.id)}
                    >
                      <Text style={styles.menuIcon}>⋮</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Dropdown Menu */}
                  {menuVisible === item.id && (
                    <Modal
                      transparent
                      visible={menuVisible === item.id}
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
                              handleDelete(item.id);
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
          )}
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
  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 12 },
  table: {
    backgroundColor: colors.card,
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
  tableCell: { justifyContent: 'center', paddingRight: 4 },
  tableCellText: { fontSize: 13, color: colors.foreground, fontWeight: '500' },
  tableCellSubtext: { fontSize: 11, color: colors.mutedForeground, fontWeight: '400', marginTop: 2 },
  tableCellPrice: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailImage: { 
    width: 48, 
    height: 48, 
    borderRadius: 8,
    backgroundColor: colors.muted,
  },
  thumbnailEmoji: { fontSize: 20 },
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
  actionIcon: { fontSize: 18 },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontWeight: '500',
  },
});
