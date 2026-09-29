import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './navigation/AppNavigator';
import { BusProvider } from './context/BusContext';

/**
 * NASAN is deliberately a frontend-only prototype. BusProvider holds all
 * mock state in memory so changes made in Driver screens appear immediately
 * in Passenger screens while the app remains open.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <BusProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </BusProvider>
    </SafeAreaProvider>
  );
}
