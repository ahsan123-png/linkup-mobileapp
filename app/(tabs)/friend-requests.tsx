import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data for friend requests (replace with actual data later)
const mockFriendRequests = [
  {
    id: '1',
    from_user_id: '2',
    from_user_name: 'Alice Johnson',
    from_user_username: 'alicej',
    from_user_avatar: null,
    status: 'pending',
    created_at: '2024-01-15T10:30:00Z',
    is_new: true,
  },
  {
    id: '2',
    from_user_id: '3',
    from_user_name: 'Bob Smith',
    from_user_username: 'bobsmith',
    from_user_avatar: null,
    status: 'pending',
    created_at: '2024-01-14T15:45:00Z',
    is_new: true,
  },
  {
    id: '3',
    from_user_id: '4',
    from_user_name: 'Carol Davis',
    from_user_username: 'carold',
    from_user_avatar: null,
    status: 'pending',
    created_at: '2024-01-13T09:20:00Z',
    is_new: false,
  },
  {
    id: '4',
    from_user_id: '5',
    from_user_name: 'David Wilson',
    from_user_username: 'davidw',
    from_user_avatar: null,
    status: 'pending',
    created_at: '2024-01-12T14:10:00Z',
    is_new: false,
  },
];

type FriendRequest = {
  id: string;
  from_user_id: string;
  from_user_name: string;
  from_user_username: string;
  from_user_avatar: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  is_new: boolean;
};

export default function FriendRequestsScreen() {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(mockFriendRequests);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate new requests count
  const newRequestsCount = friendRequests.filter(req => req.is_new && req.status === 'pending').length;
  const totalRequestsCount = friendRequests.filter(req => req.status === 'pending').length;

  // Load friend requests
  const loadFriendRequests = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetchFriendRequests();
      // setFriendRequests(response);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to load friend requests:', error);
      Alert.alert('Error', 'Failed to load friend requests');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriendRequests();
    setRefreshing(false);
  };

  useEffect(() => {
    loadFriendRequests();
  }, []);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      // TODO: Replace with actual API call
      // await acceptFriendRequest(requestId);
      
      // Update local state
      setFriendRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: 'accepted', is_new: false } : req
        )
      );
      
      Alert.alert('Success', 'Friend request accepted!');
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      // TODO: Replace with actual API call
      // await rejectFriendRequest(requestId);
      
      // Update local state
      setFriendRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: 'rejected', is_new: false } : req
        )
      );
      
      Alert.alert('Success', 'Friend request rejected');
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getAvatarSource = (avatar: string | null) => {
    if (avatar) {
      return { uri: avatar };
    }
    return require('../../assets/images/default-avatar.png');
  };

  const renderFriendRequestItem = ({ item }: { item: FriendRequest }) => (
    <View className="bg-surface rounded-xl p-4 mb-3 mx-4">
      <View className="flex-row items-center">
        {/* User Avatar */}
        <View className="relative">
          <Image
            source={getAvatarSource(item.from_user_avatar)}
            className="w-14 h-14 rounded-full"
            defaultSource={require('../../assets/images/default-avatar.png')}
          />
          {item.is_new && (
            <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-surface" />
          )}
        </View>

        {/* User Info */}
        <View className="flex-1 ml-4">
          <Text className="text-white font-semibold text-base" numberOfLines={1}>
            {item.from_user_name}
          </Text>
          <Text className="text-text-secondary text-sm mt-1" numberOfLines={1}>
            @{item.from_user_username}
          </Text>
          <Text className="text-text-secondary text-xs mt-1">
            {formatDate(item.created_at)}
          </Text>
        </View>

        {/* Action Buttons */}
        {item.status === 'pending' && (
          <View className="flex-row space-x-2 gap-2">
            <TouchableOpacity
              className="bg-red-500 w-10 h-10 rounded-full items-center justify-center"
              onPress={() => handleRejectRequest(item.id)}
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-primary w-10 h-10 rounded-full items-center justify-center"
              onPress={() => handleAcceptRequest(item.id)}
            >
              <Ionicons name="checkmark" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Status Indicator */}
        {item.status === 'accepted' && (
          <View className="bg-green-500/20 px-3 py-2 rounded-lg">
            <Text className="text-green-500 text-xs font-semibold">Accepted</Text>
          </View>
        )}

        {item.status === 'rejected' && (
          <View className="bg-red-500/20 px-3 py-2 rounded-lg">
            <Text className="text-red-500 text-xs font-semibold">Rejected</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20 px-4">
      <Ionicons name="people-outline" size={80} color="#666666" />
      <Text className="text-text-secondary text-center mt-6 text-xl font-semibold">
        No Friend Requests
      </Text>
      <Text className="text-text-secondary text-center mt-2 text-base">
        When someone sends you a friend request, it will appear here.
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text className="text-text-secondary mt-4">Loading friend requests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-surface pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="mr-4"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Friend Requests</Text>
          </View>

          {/* Request Counter */}
          {totalRequestsCount > 0 && (
            <View className="bg-primary px-3 py-1 rounded-full">
              <Text className="text-white text-sm font-semibold">
                {totalRequestsCount}
              </Text>
            </View>
          )}
        </View>

        {/* New Requests Indicator */}
        {newRequestsCount > 0 && (
          <View className="bg-red-500/20 border border-red-500 rounded-lg p-3 mt-4 flex-row items-center">
            <Ionicons name="notifications" size={20} color="#FF6B6B" />
            <Text className="text-red-400 ml-2 font-semibold flex-1">
              {newRequestsCount} new request{newRequestsCount !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Friend Requests List */}
      <FlatList
        data={friendRequests.filter(req => req.status === 'pending')}
        renderItem={renderFriendRequestItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4CAF50"
            colors={['#4CAF50']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 16 }}
        className="flex-1"
      />

      {/* History Section */}
      {friendRequests.filter(req => req.status !== 'pending').length > 0 && (
        <View className="border-t border-border pt-4">
          <Text className="text-text-secondary text-sm font-semibold px-4 mb-3">
            Request History
          </Text>
          <FlatList
            data={friendRequests.filter(req => req.status !== 'pending')}
            renderItem={renderFriendRequestItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}