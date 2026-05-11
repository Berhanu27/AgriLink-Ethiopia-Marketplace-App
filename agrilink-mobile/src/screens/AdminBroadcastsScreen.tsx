import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, RefreshControl, Image, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../lib/theme';
import { api, ApiError } from '../lib/api';
import { uploadToCloudinary } from '../lib/cloudinary';
import { formatDate } from '../lib/dateUtils';

interface Broadcast {
  id: number;
  cropName: string;
  price: number;
  unit: string;
  note?: string;
  imageUrl?: string | null;
  createdAt: string;
}

export default function AdminBroadcastsScreen({ navigation }: any) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ cropName: '', price: '', unit: 'kg', note: '' });
  const [image, setImage] = useState<{ uri: string; name?: string; type?: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const data = await api.broadcasts.getAll();
      setBroadcasts(data);
    } catch (error) {
      console.error('Failed to fetch broadcasts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setImage({ uri: asset.uri, name: asset.fileName || 'broadcast.jpg', type: asset.mimeType || 'image/jpeg' });
    setImagePreview(asset.uri);
  };

  const handlePublish = async () => {
    if (!form.cropName || !form.price) {
      Alert.alert('Error', 'Please fill in crop name and price');
      return;
    }
    try {
      let imageUrl: string | undefined;
      if (image) imageUrl = await uploadToCloudinary(image);
      
      const data = {
        cropName: form.cropName,
        price: parseFloat(form.price),
        unit: form.unit,
        note: form.note || undefined,
        imageUrl,
      };

      if (editingId) {
        await api.broadcasts.update(editingId, data);
        setBroadcasts(prev => prev.map(b => b.id === editingId ? { ...b, ...data } : b));
        Alert.alert('Success', 'Broadcast updated');
      } else {
        const created = await api.broadcasts.create(data);
        setBroadcasts(prev => [created, ...prev]);
        Alert.alert('Success', 'Broadcast published');
      }
      
      setForm({ cropName: '', price: '', unit: 'kg', note: '' });
      setEditingId(null);
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to publish broadcast');
    }
  };

  const handleEdit = (broadcast: Broadcast) => {
    setEditingId(broadcast.id);
    setForm({
      cropName: broadcast.cropName,
      price: String(broadcast.price),
      unit: broadcast.unit || 'kg',
      note: broadcast.note || '',
    });
    setImage(null);
    setImagePreview(broadcast.imageUrl || null);
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Confirm Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.broadcasts.delete(id);
            setBroadcasts(prev => prev.filter(b => b.id !== id));
            Alert.alert('Success', 'Broadcast deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Broadcasts</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{broadcasts.length}</Text>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBroadcasts(); }} />
        }
      >
        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>{editingId ? 'Edit' : 'Post'} Major Crop Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Crop name"
            value={form.cropName}
            onChangeText={(text) => setForm(prev => ({ ...prev, cropName: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Price (ETB)"
            keyboardType="numeric"
            value={form.price}
            onChangeText={(text) => setForm(prev => ({ ...prev, price: text }))}
          />
          <View style={styles.unitRow}>
            {['kg', 'quintal', 'ton'].map(u => (
              <TouchableOpacity
                key={u}
                style={[styles.unitBtn, form.unit === u && styles.unitBtnActive]}
                onPress={() => setForm(prev => ({ ...prev, unit: u }))}
              >
                <Text style={[styles.unitText, form.unit === u && styles.unitTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Note (optional)"
            value={form.note}
            onChangeText={(text) => setForm(prev => ({ ...prev, note: text }))}
          />
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonText}>Choose Image</Text>
          </TouchableOpacity>
          {imagePreview && <Image source={{ uri: imagePreview }} style={styles.imagePreview} />}
          <TouchableOpacity style={styles.publishBtn} onPress={handlePublish}>
            <Text style={styles.publishBtnText}>{editingId ? 'Update' : 'Publish'}</Text>
          </TouchableOpacity>
          {editingId && (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => {
              setEditingId(null);
              setForm({ cropName: '', price: '', unit: 'kg', note: '' });
              setImage(null);
              setImagePreview(null);
            }}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Image</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Crop</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Price</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>Unit</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}></Text>
          </View>
          {broadcasts.map(broadcast => (
            <View key={broadcast.id} style={styles.tableRow}>
              <View style={[styles.tableCell, { flex: 0.8 }]}>
                {broadcast.imageUrl ? (
                  <Image source={{ uri: broadcast.imageUrl }} style={styles.thumbnailImage} />
                ) : (
                  <View style={styles.thumbnail}>
                    <Text style={styles.thumbnailEmoji}>🌾</Text>
                  </View>
                )}
              </View>
              <View style={[styles.tableCell, { flex: 1.5 }]}>
                <Text style={styles.tableCellText}>{broadcast.cropName}</Text>
                {broadcast.note && (
                  <Text style={styles.tableCellSubtext} numberOfLines={1}>{broadcast.note}</Text>
                )}
              </View>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text style={styles.tableCellPrice}>{broadcast.price}</Text>
              </View>
              <View style={[styles.tableCell, { flex: 0.8 }]}>
                <View style={styles.unitBadge}>
                  <Text style={styles.unitBadgeText}>{broadcast.unit}</Text>
                </View>
              </View>
              <View style={[styles.tableCell, { flex: 0.5 }]}>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setMenuVisible(broadcast.id)}
                >
                  <Text style={styles.menuIcon}>⋮</Text>
                </TouchableOpacity>
              </View>
              
              {/* Dropdown Menu */}
              {menuVisible === broadcast.id && (
                <Modal
                  transparent
                  visible={menuVisible === broadcast.id}
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
                          handleEdit(broadcast);
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
                          handleDelete(broadcast.id);
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
  form: { backgroundColor: colors.card, margin: 16, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border },
  formTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 12 },
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
  table: {
    backgroundColor: colors.card,
    margin: 16,
    marginTop: 0,
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
  tableCellPrice: { fontSize: 14, color: colors.primary, fontWeight: '700' },
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
  unitBadge: { backgroundColor: colors.muted, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  unitBadgeText: { fontSize: 10, fontWeight: '600', color: colors.foreground },
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
