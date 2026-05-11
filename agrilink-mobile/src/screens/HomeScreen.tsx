import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../lib/theme';
import AdminDashboardScreen from './AdminDashboardScreen';
import FarmerDashboardScreen from './FarmerDashboardScreen';
import BuyerDashboardScreen from './BuyerDashboardScreen';
import TransporterDashboardScreen from './TransporterDashboardScreen';
import CooperativeDashboardScreen from './CooperativeDashboardScreen';

export default function HomeScreen({ navigation }: any) {
  const { currentUser } = useApp();

  if (!currentUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Route to role-specific dashboard
  switch (currentUser.role) {
    case 'admin':
      return <AdminDashboardScreen navigation={navigation} />;
    case 'farmer':
      return <FarmerDashboardScreen navigation={navigation} />;
    case 'buyer':
      return <BuyerDashboardScreen navigation={navigation} />;
    case 'transporter':
      return <TransporterDashboardScreen navigation={navigation} />;
    case 'cooperative':
      return <CooperativeDashboardScreen navigation={navigation} />;
    default:
      return <FarmerDashboardScreen navigation={navigation} />;
  }
}




