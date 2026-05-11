import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { getListingUploadPreset, uploadToCloudinary } from '../lib/cloudinary';

export default function AddListingScreen({ navigation }: any) {
  const { currentUser, addListing } = useApp();
  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [listingImage, setListingImage] = useState<{ uri: string; name?: string; type?: string } | null>(null);

  const pickListingImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setListingImage({
      uri: asset.uri,
      name: asset.fileName || 'listing.jpg',
      type: asset.mimeType || 'image/jpeg',
    });
  };

  const handleSubmit = async () => {
    if (!cropName.trim() || !quantity.trim() || !price.trim()) {
      Alert.alert('Error', 'Crop name, quantity and price are required');
      return;
    }
    if (!currentUser) return;

    setLoading(true);
    let imageUrl: string | undefined;
    try {
      if (listingImage) {
        imageUrl = await uploadToCloudinary(listingImage, getListingUploadPreset());
      }
    } catch (error) {
      console.error('Listing image upload failed', error);
      Alert.alert('Error', 'Image upload failed. Please try again.');
      setLoading(false);
      return;
    }

    const success = await addListing({
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerRegion: currentUser.region,
      farmerVerified: currentUser.verified,
      cropName: cropName.trim(),
      quantity: quantity.trim(),
      unit: unit.trim() || 'kg',
      pricePerUnit: Number(price),
      totalPrice: Number(price),
      location: location.trim() || currentUser.region,
      status: 'active',
      description: description.trim(),
      imageUrl,
      views: 0,
      inquiries: 0,
    });
    setLoading(false);

    if (success) {
      Alert.alert('Success', 'Listing added!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } else {
      Alert.alert('Error', 'Failed to add listing. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Add Listing</Text>

        <Text style={styles.label}>Crop Name *</Text>
        <TextInput style={styles.input} placeholder="e.g. Teff, Maize" value={cropName} onChangeText={setCropName} />

        <Text style={styles.label}>Quantity *</Text>
        <TextInput style={styles.input} placeholder="e.g. 100" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />

        <Text style={styles.label}>Unit</Text>
        <TextInput style={styles.input} placeholder="kg, quintal, ton" value={unit} onChangeText={setUnit} />

        <Text style={styles.label}>Price per unit (ETB) *</Text>
        <TextInput style={styles.input} placeholder="e.g. 2500" value={price} onChangeText={setPrice} keyboardType="numeric" />

        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} placeholder="e.g. Addis Ababa" value={location} onChangeText={setLocation} />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Additional details..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Listing Image</Text>
        <TouchableOpacity style={styles.imageButton} onPress={pickListingImage}>
          <Text style={styles.imageButtonText}>Choose Image</Text>
        </TouchableOpacity>
        {listingImage?.uri ? (
          <Image source={{ uri: listingImage.uri }} style={styles.imagePreview} />
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Post Listing</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  inner: { padding: 20, paddingTop: 48 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 10, padding: 13, fontSize: 15, marginBottom: 14,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  imageButton: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 14,
  },
  imageButtonText: { color: '#111827', fontSize: 14, fontWeight: '600' },
  imagePreview: { width: '100%', height: 180, borderRadius: 10, marginBottom: 14 },
  button: {
    backgroundColor: '#16a34a', borderRadius: 10,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
