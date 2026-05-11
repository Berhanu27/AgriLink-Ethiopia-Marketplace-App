import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { colors } from '../lib/theme';
import { UserRole } from '../types';
import t from '../lib/i18n';
import { getTransporterUploadPreset, uploadToCloudinary } from '../lib/cloudinary';

const REGIONS = [
  'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz',
  'Dire Dawa', 'Gambela', 'Harari', 'Oromia',
  'Sidama', 'SNNPR', 'Somali', 'Tigray',
];

const ROLES: { value: UserRole; label: string; icon: string }[] = [
  { value: 'farmer', label: 'Farmer', icon: '🌾' },
  { value: 'buyer', label: 'Buyer', icon: '🛒' },
  { value: 'transporter', label: 'Transporter', icon: '🚚' },
  { value: 'cooperative', label: 'Cooperative', icon: '🤝' },
];

export default function RegisterScreen({ navigation }: any) {
  const { register, language } = useApp();
  const tr = t[language];
  const [loading, setLoading] = useState(false);
  const [vehicleImage, setVehicleImage] = useState<{ uri: string; name?: string; type?: string } | null>(null);

  const pickVehicleImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setVehicleImage({
      uri: asset.uri,
      name: asset.fileName || 'vehicle.jpg',
      type: asset.mimeType || 'image/jpeg',
    });
  };
  const [formData, setFormData] = useState({
    name: '', phone: '', nationalId: '', region: '',
    role: 'farmer' as UserRole, password: '', confirmPassword: '',
    vehicleType: '', vehicleCapacity: '', cooperativeName: '',
  });

  const set = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.region || !formData.password) {
      Alert.alert('Error', tr.fillRequired); return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', tr.passwordMismatch); return;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', tr.passwordShort); return;
    }
    setLoading(true);
    let vehicleImageUrl: string | undefined;
    try {
      if (formData.role === 'transporter' && vehicleImage) {
        vehicleImageUrl = await uploadToCloudinary(vehicleImage, getTransporterUploadPreset());
      }
    } catch (error) {
      console.error('Vehicle image upload failed', error);
      Alert.alert('Error', 'Image upload failed. Please try again.');
      setLoading(false);
      return;
    }

    const success = await register({
      name: formData.name, phone: formData.phone,
      role: formData.role, region: formData.region,
      nationalId: formData.nationalId || undefined,
      vehicleType: formData.vehicleType || undefined,
      vehicleCapacity: formData.vehicleCapacity || undefined,
      vehicleImageUrl,
      cooperativeName: formData.cooperativeName || undefined,
    }, formData.password);
    setLoading(false);
    if (!success) Alert.alert(tr.registrationFailed, tr.fillRequired);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Landing')} style={styles.logoRow}>
          <Text style={styles.logoIcon}>🌱</Text>
          <View>
            <Text style={styles.logoText}>AgriLink</Text>
            <Text style={styles.logoSub}>Ethiopia</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>{tr.createAccount}</Text>
          <Text style={styles.subtitle}>{tr.registerSubtitle}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{tr.iAmA}</Text>
            <View style={styles.rolesRow}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.roleBtn, formData.role === r.value && styles.roleBtnActive]}
                  onPress={() => set('role', r.value)}
                >
                  <Text style={styles.roleIcon}>{r.icon}</Text>
                  <Text style={[styles.roleLabel, formData.role === r.value && styles.roleLabelActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Field label={formData.role === 'cooperative' ? tr.cooperativeName : tr.fullName} icon="👤"
            value={formData.name} onChangeText={v => set('name', v)} placeholder={tr.fullName} />

          {formData.role === 'cooperative' && (
            <Field label={tr.orgName} icon="🏢"
              value={formData.cooperativeName} onChangeText={v => set('cooperativeName', v)}
              placeholder={tr.orgName} />
          )}

          <Field label={tr.phoneNumber} icon="📞"
            value={formData.phone} onChangeText={v => set('phone', v)}
            placeholder="+251911234567" keyboardType="phone-pad" />

          <Field label={tr.nationalId} icon="🪪"
            value={formData.nationalId} onChangeText={v => set('nationalId', v)}
            placeholder={tr.nationalId} />

          <View style={styles.field}>
            <Text style={styles.label}>{tr.region}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionScroll}>
              {REGIONS.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.regionChip, formData.region === r && styles.regionChipActive]}
                  onPress={() => set('region', r)}
                >
                  <Text style={[styles.regionText, formData.region === r && styles.regionTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Transporter fields */}
          {formData.role === 'transporter' && (
            <>
              <Field label={tr.vehicleType} icon="🚛"
                value={formData.vehicleType} onChangeText={v => set('vehicleType', v)}
                placeholder="e.g. Truck, Pickup" />
              <Field label={tr.vehicleCapacity} icon="⚖️"
                value={formData.vehicleCapacity} onChangeText={v => set('vehicleCapacity', v)}
                placeholder="e.g. 5 tons" />
              <View style={styles.field}>
                <Text style={styles.label}>Vehicle Image</Text>
                <TouchableOpacity style={styles.imageButton} onPress={pickVehicleImage}>
                  <Text style={styles.imageButtonText}>Choose Image</Text>
                </TouchableOpacity>
                {vehicleImage?.uri ? (
                  <Image source={{ uri: vehicleImage.uri }} style={styles.imagePreview} />
                ) : null}
              </View>
            </>
          )}

          <Field label={tr.password} icon="🔒"
            value={formData.password} onChangeText={v => set('password', v)}
            placeholder="Min 6 characters" secureTextEntry />

          <Field label={tr.confirmPassword} icon="🔒"
            value={formData.confirmPassword} onChangeText={v => set('confirmPassword', v)}
            placeholder={tr.confirmPassword} secureTextEntry />

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{tr.register}</Text>}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>{tr.alreadyAccount}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>{tr.loginLink}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, icon, value, onChangeText, placeholder, keyboardType, secureTextEntry }: any) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{icon} {label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        secureTextEntry={secureTextEntry || false}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.card, paddingHorizontal: 16,
    paddingTop: 48, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { fontSize: 28 },
  logoText: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  logoSub: { fontSize: 11, color: colors.mutedForeground },
  inner: { flexGrow: 1, padding: 20 },
  card: {
    backgroundColor: colors.card, borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: colors.border,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.foreground, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.mutedForeground, marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 6 },
  input: {
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 14, fontSize: 15, color: colors.foreground, minHeight: 48,
  },
  imageButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  imageButtonText: { color: colors.foreground, fontSize: 13, fontWeight: '600' },
  imagePreview: { width: '100%', height: 160, marginTop: 10, borderRadius: 10 },
  rolesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  roleBtn: {
    flex: 1, minWidth: 70, alignItems: 'center', padding: 10,
    borderRadius: 10, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  roleBtnActive: { borderColor: colors.primary, backgroundColor: '#f0fdf4' },
  roleIcon: { fontSize: 22, marginBottom: 4 },
  roleLabel: { fontSize: 11, color: colors.mutedForeground, fontWeight: '600' },
  roleLabelActive: { color: colors.primary },
  regionScroll: { marginTop: 4 },
  regionChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, marginRight: 8,
    backgroundColor: colors.inputBg,
  },
  regionChipActive: { borderColor: colors.primary, backgroundColor: '#f0fdf4' },
  regionText: { fontSize: 13, color: colors.mutedForeground },
  regionTextActive: { color: colors.primary, fontWeight: '600' },
  button: {
    backgroundColor: colors.primary, borderRadius: 10,
    padding: 16, alignItems: 'center', marginTop: 8, minHeight: 48, justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  loginPrompt: { color: colors.mutedForeground, fontSize: 14 },
  loginLink: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
