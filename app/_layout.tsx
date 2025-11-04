import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './components/auth/AuthContext';
import './global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </AuthProvider>
  );
}