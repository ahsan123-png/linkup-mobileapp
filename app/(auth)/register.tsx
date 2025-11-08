import { COLORS } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../components/auth/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const handleRegister = async () => {
    const { full_name, email, password, confirmPassword } = formData;

    if (!full_name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    const success = await register({ full_name, email, password });
    
    if (success) {
      // Success - automatically redirect to main screen
      console.log('Registration successful, redirecting to main screen...');
      router.replace('/(tabs)/chat');
    } else {
      setError('Registration failed. Please try again with different credentials.');
    }
    
    setIsLoading(false);
  };

  const navigateToLogin = () => {
    router.back();
  };

  return (
    <ScrollView 
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Background Decorations */}
      <View className="absolute top-0 right-0">
        <View className="w-64 h-64 bg-primary rounded-full opacity-10 -translate-y-32 translate-x-20" />
      </View>
      <View className="absolute bottom-0 left-0">
        <View className="w-80 h-80 bg-primaryDark rounded-full opacity-10 -translate-x-32 translate-y-32" />
      </View>

      <View className="flex-1 justify-center px-8 py-12">
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Header */}
          <View className="items-center mb-8">
            <TouchableOpacity 
              className="self-start mb-6"
              onPress={navigateToLogin}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
            
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-primary rounded-2xl items-center justify-center mr-3">
                <Text className="text-2xl font-bold text-white">L</Text>
              </View>
              <Text className="text-4xl font-bold text-white">
                Link<Text className="text-primary">Up</Text>
              </Text>
            </View>
            <Text className="text-text-secondary text-lg text-center">
              Create your account to get started
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-6">
              <Text className="text-red-400 text-center">{error}</Text>
            </View>
          ) : null}

          {/* Registration Form */}
          <View className="space-y-5">
            {/* Full Name Input */}
            <View className="space-y-2">
              <Text className="text-text-secondary text-sm font-medium ml-1">
                Full Name
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Ionicons name="person-outline" size={20} color={COLORS.text.secondary} />
                </View>
                <TextInput
                  className="w-full bg-surface border border-border text-white pl-12 pr-4 py-4 rounded-2xl text-base"
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.text.secondary}
                  value={formData.full_name}
                  onChangeText={(value) => handleInputChange('full_name', value)}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Email Input */}
            <View className="space-y-2">
              <Text className="text-text-secondary text-sm font-medium ml-1">
                Email Address
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Ionicons name="mail-outline" size={20} color={COLORS.text.secondary} />
                </View>
                <TextInput
                  className="w-full bg-surface border border-border text-white pl-12 pr-4 py-4 rounded-2xl text-base"
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.text.secondary}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  editable={!isLoading}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="space-y-2">
              <Text className="text-text-secondary text-sm font-medium ml-1">
                Password
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.text.secondary} />
                </View>
                <TextInput
                  className="w-full bg-surface border border-border text-white pl-12 pr-12 py-4 rounded-2xl text-base"
                  placeholder="Create a password"
                  placeholderTextColor={COLORS.text.secondary}
                  secureTextEntry={secureTextEntry}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
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

            {/* Confirm Password Input */}
            <View className="space-y-2">
              <Text className="text-text-secondary text-sm font-medium ml-1">
                Confirm Password
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.text.secondary} />
                </View>
                <TextInput
                  className="w-full bg-surface border border-border text-white pl-12 pr-12 py-4 rounded-2xl text-base"
                  placeholder="Confirm your password"
                  placeholderTextColor={COLORS.text.secondary}
                  secureTextEntry={confirmSecureTextEntry}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  className="absolute right-4 top-4"
                  onPress={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)}
                >
                  <Ionicons 
                    name={confirmSecureTextEntry ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={COLORS.text.secondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              className={`w-full py-4 rounded-2xl mt-4 ${
                isLoading ? 'bg-primary/70' : 'bg-primary'
              }`}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-text-secondary">Already have an account? </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text className="text-primary font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}