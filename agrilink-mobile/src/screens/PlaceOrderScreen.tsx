import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Listing } from '../types';

export default function PlaceOrderScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { createOrder } = useApp();
  const { listing } = route.params as { listing: Listing };

  const [requestedQuantity, setRequestedQuantity] = useState('');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [buyerMessage, setBuyerMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!requestedQuantity.trim()) {
      Alert.alert('Required', 'Please enter the quantity you need');
      return;
    }

    setLoading(true);
    try {
      const success = await createOrder({
        sellerId: listing.farmerId,
        listingId: listing.id,
        cropName: listing.cropName,
        requestedQuantity: requestedQuantity.trim(),
        unit: listing.unit,
        offeredPrice: offeredPrice ? Number(offeredPrice) : undefined,
        buyerMessage: buyerMessage.trim() || undefined,
      });

      if (success) {
        Alert.alert('Success', 'Order placed successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', 'Failed to place order. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Place Order</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Listing Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Listing Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Crop:</Text>
            <Text style={styles.value}>{listing.cropName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Available:</Text>
            <Text style={styles.value}>{listing.quantity} {listing.unit}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Price:</Text>
            <Text style={styles.priceValue}>ETB {listing.pricePerUnit.toLocaleString()} / {listing.unit}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Seller:</Text>
            <Text style={styles.value}>{listing.farmerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>{listing.location}</Text>
          </View>
        </View>

        {/* Order Form */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Order</Text>

          <Text style={styles.inputLabel}>Quantity Needed *</Text>
          <TextInput
            style={styles.input}
            value={requestedQuantity}
            onChangeText={setRequestedQuantity}
            placeholder={`e.g., 50 ${listing.unit}`}
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Your Offered Price (optional)</Text>
          <TextInput
            style={styles.input}
            value={offeredPrice}
            onChangeText={setOfferedPrice}
            placeholder="ETB per unit"
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Message to Seller (optional)</Text>
          <TextInput
            style={styles.textArea}
            value={buyerMessage}
            onChangeText={setBuyerMessage}
            placeholder="Add any special requests or questions..."
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Placing Order...' : 'Place Order'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 The seller will review your order and respond with availability and final pricing.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    color: '#16a34a',
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});
