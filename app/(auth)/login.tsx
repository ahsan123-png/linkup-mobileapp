import { COLORS } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert, Animated,
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../components/auth/AuthContext';

const { width } = Dimensions.get('window');

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  const { login } = useAuth();
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    const success = await login(username, password);
    
    if (success) {
      router.replace('/(auth)/login');
    } else {
      Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
    }
    
    setIsLoading(false);
  };

  const navigateToRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <ScrollView 
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Background Decorations */}
      <View className="absolute top-0 left-0">
        <View className="w-64 h-64 bg-primary rounded-full opacity-10 -translate-x-32 -translate-y-32" />
      </View>
      <View className="absolute bottom-0 right-0">
        <View className="w-80 h-80 bg-primaryDark rounded-full opacity-10 translate-x-20 translate-y-20" />
      </View>

      <View className="flex-1 justify-center px-8 py-12">
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Header */}
          <View className="items-center mb-12">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-primary rounded-2xl items-center justify-center mr-3">
                <Text className="text-2xl font-bold text-white">L</Text>
              </View>
             <Text className="text-4xl font-bold text-white">
                Link
                <Text className="text-primary">Up</Text>
              </Text>
            </View>
            <Text className="text-text-secondary text-lg text-center">
              Welcome back! Sign in to continue
            </Text>
          </View>

          {/* Login Form */}
          <View className="space-y-6">
            {/* Username Input */}
            <View className="space-y-2">
              <Text className="text-text-secondary text-sm font-medium ml-1 mb-3">
                Username or Email
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Ionicons name="person-outline" size={20} color={COLORS.text.secondary} />
                </View>
                <TextInput
                  className="w-full bg-surface border border-border text-white pl-12 pr-4 py-4 rounded-2xl text-base"
                  placeholder="Enter your username or email"
                  placeholderTextColor={COLORS.text.secondary}
                  value={username}
                  onChangeText={setUsername}
                  editable={!isLoading}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="space-y-2 mt-4">
              <Text className="text-text-secondary text-sm font-medium ml-1 mb-3">
                Password
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.text.secondary} />
                </View>
                <TextInput
                  className="w-full bg-surface border border-border text-white pl-12 pr-12 py-4 rounded-2xl text-base"
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.text.secondary}
                  secureTextEntry={secureTextEntry}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  className="absolute right-4 top-4"
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                >
                  <Ionicons 
                    name={secureTextEntry ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={COLORS.text.secondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="self-end">
              <Text className="text-primary text-sm font-medium">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className={`w-full py-4 rounded-2xl mt-4 ${
                isLoading ? 'bg-primary/70' : 'bg-primary'
              }`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-border" />
              <Text className="mx-4 text-text-secondary text-sm">OR</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center">
              <Text className="text-text-secondary">Don't have an account? </Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text className="text-primary font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}