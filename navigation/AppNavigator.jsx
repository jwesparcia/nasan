import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import PassengerHomeScreen from '../screens/passenger/PassengerHomeScreen';
import PassengerMapScreen from '../screens/passenger/PassengerMapScreen';
import BusDetailsScreen from '../screens/passenger/BusDetailsScreen';
import DriverDashboardScreen from '../screens/driver/DriverDashboardScreen';
import DriverMapScreen from '../screens/driver/DriverMapScreen';

const Stack = createNativeStackNavigator();
const PassengerTabs = createBottomTabNavigator();
const DriverTabs = createBottomTabNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F3F7FC',
    card: '#FFFFFF',
    text: '#102D4B',
    primary: '#0B5CAB',
    border: '#E3ECF4',
  },
};

function TabIcon({ children, color }) {
  return <Text style={{ color, fontSize: 18 }}>{children}</Text>;
}

function PassengerNavigator() {
  return (
    <PassengerTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0B5CAB',
        tabBarInactiveTintColor: '#8291A2',
        tabBarStyle: {
          height: 66,
          paddingTop: 7,
          borderTopColor: '#E3ECF4',
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color }) => (
          <TabIcon color={color}>{route.name === 'PassengerHome' ? '⌂' : '⌖'}</TabIcon>
        ),
      })}
    >
      <PassengerTabs.Screen name="PassengerHome" component={PassengerHomeScreen} options={{ title: 'Nearby' }} />
      <PassengerTabs.Screen name="PassengerMap" component={PassengerMapScreen} options={{ title: 'Map' }} />
    </PassengerTabs.Navigator>
  );
}

function DriverNavigator() {
  return (
    <DriverTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0B5CAB',
        tabBarInactiveTintColor: '#8291A2',
        tabBarStyle: {
          height: 66,
          paddingTop: 7,
          borderTopColor: '#E3ECF4',
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color }) => (
          <TabIcon color={color}>{route.name === 'DriverDashboard' ? '▦' : '⌖'}</TabIcon>
        ),
      })}
    >
      <DriverTabs.Screen name="DriverDashboard" component={DriverDashboardScreen} options={{ title: 'Dashboard' }} />
      <DriverTabs.Screen name="DriverMap" component={DriverMapScreen} options={{ title: 'Route map' }} />
    </DriverTabs.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="RoleSelection"
        screenOptions={{
          headerShadowVisible: false,
          headerTintColor: '#102D4B',
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: '#F3F7FC' },
        }}
      >
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PassengerArea" component={PassengerNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="DriverArea" component={DriverNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="BusDetails" component={BusDetailsScreen} options={{ title: 'Bus details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
