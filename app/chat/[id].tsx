import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
  },
});

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const isAI = id === 'linko';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={[styles.title, { marginLeft: 16, marginBottom: 0 }]}>
          {isAI ? 'Linko AI' : `Chat ${id}`}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {isAI 
            ? 'Chat with AI Assistant' 
            : `Chat with user ID: ${id}`
          }
        </Text>
        <Text style={[styles.subtitle, { marginTop: 20 }]}>
          Real messaging functionality coming soon!
        </Text>
      </View>
    </SafeAreaView>
  );
}