import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useApp } from '../context/AppContext';
import { Listing } from '../types';

export default function SearchScreen({ navigation }: any) {
  const { listings } = useApp();
  const [query, setQuery] = useState('');

  const filtered = listings.filter(l =>
    l.cropName.toLowerCase().includes(query.toLowerCase()) ||
    l.location.toLowerCase().includes(query.toLowerCase()) ||
    l.farmerName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search crops, location, farmer..."
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ListingDetail', { listing: item })}>
            <View style={styles.cardLeft}>
              <Text style={styles.cropName}>{item.cropName}</Text>
              <Text style={styles.price}>ETB {item.pricePerUnit.toLocaleString()} / {item.unit}</Text>
              <Text style={styles.meta}>{item.quantity} {item.unit} · {item.location}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{query ? 'No results found' : 'Start typing to search'}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 12 },
  searchInput: {
    backgroundColor: '#f3f4f6', borderRadius: 10,
    padding: 12, fontSize: 15,
  },
  list: { padding: 16, gap: 10, paddingBottom: 90 },
  card: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3,
  },
  cardLeft: { flex: 1 },
  cropName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  price: { fontSize: 14, color: '#16a34a', marginTop: 2 },
  meta: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  arrow: { fontSize: 22, color: '#d1d5db' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#9ca3af', fontSize: 15 },
});
