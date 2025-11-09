import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './components/auth/AuthContext';
import { FriendRequestProvider } from './components/chat/FriendRequestContext';
import './global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <FriendRequestProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" />
      </Stack>
    </FriendRequestProvider>
    </AuthProvider>
  );
}