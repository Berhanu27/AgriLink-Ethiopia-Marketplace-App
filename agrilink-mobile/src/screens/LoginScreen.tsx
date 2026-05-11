import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../lib/theme';
import t from '../lib/i18n';

export default function LoginScreen({ navigation }: any) {
  const { login, language } = useApp();
  const tr = t[language];
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('Error', tr.fillAllFields);
      return;
    }
    setLoading(true);
    const success = await login(phone.trim(), password);
    setLoading(false);
    if (!success) Alert.alert(tr.loginFailed, tr.invalidCredentials);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
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
          <Text style={styles.title}>{tr.welcomeBack}</Text>
          <Text style={styles.subtitle}>{tr.loginSubtitle}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{tr.phoneNumber}</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>📞</Text>
              <TextInput
                style={styles.input}
                placeholder="+251911234567"
                placeholderTextColor={colors.mutedForeground}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{tr.password}</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{tr.login}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotRow}>
            <Text style={styles.forgotText}>{tr.forgotPassword}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>{tr.noAccount}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>{tr.registerNow}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  inner: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  card: {
    backgroundColor: colors.card, borderRadius: 12, padding: 24,
    borderWidth: 1, borderColor: colors.border,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.foreground, marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.mutedForeground, marginBottom: 24, textAlign: 'center' },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, paddingHorizontal: 12, minHeight: 48,
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: colors.foreground },
  button: {
    backgroundColor: colors.primary, borderRadius: 10,
    padding: 16, alignItems: 'center', marginTop: 4, minHeight: 48, justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  forgotRow: { alignItems: 'center', marginTop: 12 },
  forgotText: { color: colors.primary, fontSize: 13 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.mutedForeground, fontSize: 13 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerPrompt: { color: colors.mutedForeground, fontSize: 14 },
  registerLink: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
