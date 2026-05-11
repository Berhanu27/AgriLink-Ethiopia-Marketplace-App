import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LandingScreen from '../screens/LandingScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import AddListingScreen from '../screens/AddListingScreen';
import DeliveryScreen from '../screens/DeliveryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import PlaceOrderScreen from '../screens/PlaceOrderScreen';
import ConnectionTestScreen from '../screens/ConnectionTestScreen';
import EditListingScreen from '../screens/EditListingScreen';
import AdminVerificationsScreen from '../screens/AdminVerificationsScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminBroadcastsScreen from '../screens/AdminBroadcastsScreen';
import AdminListingsScreen from '../screens/AdminListingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠', Search: '🔍', Add: '➕', Orders: '📦', Delivery: '🚚', Profile: '👤',
  };
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icons[name] || '•'}</Text>;
}

function MainTabs() {
  const { currentUser } = useApp();
  const insets = useSafeAreaInsets();
  const showDelivery = currentUser?.role === 'buyer' || currentUser?.role === 'transporter';
  const showAdd = currentUser?.role === 'farmer' || currentUser?.role === 'cooperative';
  const showOrders = currentUser?.role === 'buyer' || currentUser?.role === 'farmer' || currentUser?.role === 'cooperative';
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: bottomInset, height: 60 + bottomInset },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      {showAdd && <Tab.Screen name="Add" component={AddListingScreen} />}
      {showOrders && <Tab.Screen name="Orders" component={OrdersScreen} />}
      {showDelivery && <Tab.Screen name="Delivery" component={DeliveryScreen} />}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="PlaceOrder" component={PlaceOrderScreen} />
      <Stack.Screen name="EditListing" component={EditListingScreen} />
      <Stack.Screen name="AdminVerifications" component={AdminVerificationsScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminBroadcasts" component={AdminBroadcastsScreen} />
      <Stack.Screen name="AdminListings" component={AdminListingsScreen} />
      <Stack.Screen name="ConnectionTest" component={ConnectionTestScreen} />
    </Stack.Navigator>
  );
}

// Inline simple listing detail screen
function ListingDetailScreen({ route, navigation }: any) {
  const { listing } = route.params;
  const { currentUser } = useApp();
  const isBuyer = currentUser?.role === 'buyer';
  
  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb', padding: 20, paddingTop: 48 }}>
      <Text onPress={() => navigation.goBack()} style={{ color: '#16a34a', marginBottom: 16, fontSize: 16 }}>← Back</Text>
      <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827' }}>{listing.cropName}</Text>
      <Text style={{ fontSize: 20, color: '#16a34a', fontWeight: '600', marginTop: 8 }}>
        ETB {listing.pricePerUnit.toLocaleString()} / {listing.unit}
      </Text>
      <Text style={{ color: '#6b7280', marginTop: 8 }}>{listing.quantity} {listing.unit} available</Text>
      <Text style={{ color: '#6b7280', marginTop: 4 }}>📍 {listing.location}</Text>
      <Text style={{ color: '#374151', marginTop: 4 }}>Seller: {listing.farmerName}</Text>
      {listing.description ? (
        <Text style={{ color: '#374151', marginTop: 12 }}>{listing.description}</Text>
      ) : null}
      
      {isBuyer && listing.farmerId !== 'admin' && (
        <TouchableOpacity
          style={{
            backgroundColor: '#16a34a',
            padding: 16,
            borderRadius: 10,
            alignItems: 'center',
            marginTop: 24,
          }}
          onPress={() => navigation.navigate('PlaceOrder', { listing })}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Place Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useApp();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
