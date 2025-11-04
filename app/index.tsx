import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Text, View } from 'react-native';
import { useAuth } from './components/auth/AuthContext';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after delay
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (user) {
          router.replace('/(auth)/login');
        } else {
          router.replace('/(auth)/login');
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isLoading, user]);

  return (
    <View className="flex-1 bg-background justify-center items-center">
      {/* Animated Logo/Brand */}
      <Animated.View 
        style={{
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim }
          ],
        }}
        className="items-center"
      >
        {/* Logo Container with Gradient Border */}
        <View className="relative mb-8">
          <View className="absolute -inset-4 bg-gradient-to-r from-primary to-primaryDark rounded-full opacity-20 blur-lg" />
          <View className="w-32 h-32 bg-surface rounded-3xl items-center justify-center border-2 border-primary/30">
            <Text className="text-4xl font-bold text-primary">L</Text>
          </View>
        </View>

        {/* App Name */}
        <Text className="text-6xl font-bold text-white mb-2">
          Link
          <Text className="text-primary">Up</Text>
        </Text>
        
        {/* Tagline */}
        <Text className="text-lg text-text-secondary font-light">
          Connect • Chat • Collaborate
        </Text>

        {/* Loading Dots */}
        <View className="flex-row mt-12 space-x-2">
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, -10],
                    }),
                  },
                ],
              }}
              className="w-3 h-3 bg-primary rounded-full"
            />
          ))}
        </View>
      </Animated.View>

      {/* Background Pattern */}
      <View className="absolute inset-0 opacity-5">
        <View className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full" />
        <View className="absolute bottom-20 right-10 w-64 h-64 bg-primaryDark rounded-full" />
      </View>
    </View>
  );
}