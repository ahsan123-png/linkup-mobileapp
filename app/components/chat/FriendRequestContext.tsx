import { API_ENDPOINTS, BASE_URL } from '@/utils/constants';
import { Audio } from 'expo-av';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { FriendRequest } from '../../types';

interface FriendRequestContextType {
  friendRequests: FriendRequest[];
  pendingRequestsCount: number;
  loading: boolean;
  fetchFriendRequests: () => Promise<void>;
  sendFriendRequest: (toUserId: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<boolean>;
  rejectFriendRequest: (requestId: string) => Promise<boolean>;
  cancelFriendRequest: (requestId: string) => Promise<boolean>;
}

const FriendRequestContext = createContext<FriendRequestContextType | undefined>(undefined);

export function FriendRequestProvider({ children }: { children: React.ReactNode }) {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [sound, setSound] = useState<Audio.Sound>();

  const pendingRequestsCount = friendRequests.filter(req => req.status === 'pending').length;

  // Load notification sound
  useEffect(() => {
    loadNotificationSound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadNotificationSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/notification.mp3') // You'll need to add this sound file
      );
      setSound(sound);
    } catch (error) {
      console.log('Error loading sound:', error);
    }
  };

  const playNotificationSound = async () => {
    try {
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      const accessToken = await SecureStore.getItemAsync('accessToken');
      
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.FRIEND_REQUESTS}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFriendRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (toUserId: string): Promise<boolean> => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.FRIEND_REQUESTS}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to_user: toUserId }),
      });

      if (response.ok) {
        await fetchFriendRequests(); // Refresh requests
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to send friend request:', error);
      return false;
    }
  };

  const acceptFriendRequest = async (requestId: string): Promise<boolean> => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.FRIEND_REQUEST_ACTION(requestId)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (response.ok) {
        await playNotificationSound();
        await fetchFriendRequests();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      return false;
    }
  };

  const rejectFriendRequest = async (requestId: string): Promise<boolean> => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.FRIEND_REQUEST_ACTION(requestId)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (response.ok) {
        await fetchFriendRequests();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      return false;
    }
  };

  const cancelFriendRequest = async (requestId: string): Promise<boolean> => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.CANCEL_FRIEND_REQUEST(requestId)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchFriendRequests();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to cancel friend request:', error);
      return false;
    }
  };

  return (
    <FriendRequestContext.Provider value={{
      friendRequests,
      pendingRequestsCount,
      loading,
      fetchFriendRequests,
      sendFriendRequest,
      acceptFriendRequest,
      rejectFriendRequest,
      cancelFriendRequest,
    }}>
      {children}
    </FriendRequestContext.Provider>
  );
}

export const useFriendRequest = () => {
  const context = useContext(FriendRequestContext);
  if (context === undefined) {
    throw new Error('useFriendRequest must be used within a FriendRequestProvider');
  }
  return context;
};