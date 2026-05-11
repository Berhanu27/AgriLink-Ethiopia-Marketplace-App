import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Constants from 'expo-constants';

export default function ConnectionTestScreen() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.137.1:8080/api';

  const addResult = (message: string, isError = false) => {
    const icon = isError ? '❌' : '✅';
    setTestResults(prev => [...prev, `${icon} ${message}`]);
  };

  const runTests = async () => {
    setTestResults([]);
    setTesting(true);

    // Test 1: Check API URL configuration
    addResult(`API URL: ${API_URL}`);

    // Test 2: Test basic connectivity
    try {
      addResult('Testing connection to backend...');
      const response = await fetch(`${API_URL}/crops`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        addResult(`Connected! Found ${data.length} crops`);
      } else {
        addResult(`Backend responded with status: ${response.status}`, true);
      }
    } catch (error: any) {
      addResult(`Connection failed: ${error.message}`, true);
      addResult('Possible causes:', true);
      addResult('1. Backend not running', true);
      addResult('2. Wrong IP address in app.json', true);
      addResult('3. Phone and computer on different networks', true);
      addResult('4. Firewall blocking connection', true);
    }

    // Test 3: Test listings endpoint
    try {
      addResult('Testing listings endpoint...');
      const response = await fetch(`${API_URL}/listings`);
      if (response.ok) {
        const data = await response.json();
        addResult(`Listings endpoint OK! Found ${data.length} listings`);
      } else {
        addResult(`Listings endpoint returned: ${response.status}`, true);
      }
    } catch (error: any) {
      addResult(`Listings test failed: ${error.message}`, true);
    }

    // Test 4: Test transporters endpoint
    try {
      addResult('Testing transporters endpoint...');
      const response = await fetch(`${API_URL}/users/transporters/public`);
      if (response.ok) {
        const data = await response.json();
        addResult(`Transporters endpoint OK! Found ${data.length} transporters`);
      } else {
        addResult(`Transporters endpoint returned: ${response.status}`, true);
      }
    } catch (error: any) {
      addResult(`Transporters test failed: ${error.message}`, true);
    }

    setTesting(false);
    Alert.alert('Tests Complete', 'Check results below');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection Test</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Current Configuration:</Text>
        <Text style={styles.infoText}>API URL: {API_URL}</Text>
        <Text style={styles.infoText}>
          Cloud: {Constants.expoConfig?.extra?.cloudinaryCloudName || 'Not set'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, testing && styles.buttonDisabled]}
        onPress={runTests}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? 'Testing...' : 'Run Connection Tests'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.results}>
        {testResults.length === 0 ? (
          <Text style={styles.noResults}>
            Tap "Run Connection Tests" to check your backend connection
          </Text>
        ) : (
          testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))
        )}
      </ScrollView>

      <View style={styles.helpBox}>
        <Text style={styles.helpTitle}>Quick Fixes:</Text>
        <Text style={styles.helpText}>1. Check backend is running at localhost:8080</Text>
        <Text style={styles.helpText}>2. Update IP in agrilink-mobile/app.json</Text>
        <Text style={styles.helpText}>3. Restart Expo: expo start -c</Text>
        <Text style={styles.helpText}>4. Check firewall settings</Text>
        <Text style={styles.helpText}>
          5. Test in phone browser: {API_URL.replace('/api', '')}/api/crops
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1e40af',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  noResults: {
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 40,
  },
  resultText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  helpBox: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#92400e',
    marginBottom: 4,
  },
});
