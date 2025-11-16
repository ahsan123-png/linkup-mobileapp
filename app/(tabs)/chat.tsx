import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_ENDPOINTS, BASE_URL } from '../../utils/constants';
import { useAuth } from '../components/auth/AuthContext';
import { useFriendRequest } from '../components/chat/FriendRequestContext';
import { User } from '../types';

export default function ChatScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  
  const { user: currentUser } = useAuth();
  const { 
    friendRequests, 
    pendingRequestsCount, 
    sendFriendRequest, 
    cancelFriendRequest,
    fetchFriendRequests 
  } = useFriendRequest();
  const router = useRouter();

  // Load initial data
  useEffect(() => {
    loadInitialData();
    loadProfileImage();
  }, []);

  // Handle search filter - UPDATED TO MATCH REACT BEHAVIOR
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // When no search query, only show friends (isFriend === "True")
      const friends = users.filter(user => user.isFriend === "True");
      setFilteredUsers(friends);
      setSearchResults([]);
      setIsSearching(false);
    } else {
      // When searching, show all search results (both friends and non-friends)
      handleSearch(searchQuery);
    }
  }, [searchQuery, users]);

  const loadInitialData = async () => {
    await Promise.all([fetchUsers(), fetchFriendRequests()]);
  };

  const loadProfileImage = async () => {
    try {
      const savedImage = await SecureStore.getItemAsync('userProfileImage');
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error('Failed to load profile image:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.GET_ALL_USERS}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const transformedUsers: User[] = data.map((user: any) => ({
          id: user.id.toString(),
          name: user.full_name || user.username,
          username: user.username,
          email: user.email,
          avatar: user.profile_image ? `${BASE_URL}${user.profile_image}` : undefined,
          status: user.status || 'Available',
          isFriend: user.is_friend || "False",
          profile_image: user.profile_image,
        }));
        
        setUsers(transformedUsers);
        
        // UPDATED: Only show friends by default (no search query)
        const friends = transformedUsers.filter(user => user.isFriend === "True");
        setFilteredUsers(friends);
        
        // Fetch last messages for friends only
        fetchLastMessages(friends);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      Alert.alert('Error', 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLastMessages = async (friends: User[]) => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const messages: Record<string, string> = {};
      
      for (const friend of friends) {
        try {
          const response = await fetch(
            `${BASE_URL}${API_ENDPOINTS.LAST_MESSAGE(friend.username)}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            messages[friend.id] = data.last_message || 'Start a conversation';
          } else {
            messages[friend.id] = 'Start a conversation';
          }
        } catch (error) {
          messages[friend.id] = 'Start a conversation';
        }
      }
      
      setLastMessages(messages);
    } catch (error) {
      console.error('Failed to fetch last messages:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.SEARCH_USERS}?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const searchResults: User[] = data.map((user: any) => ({
          id: user.id.toString(),
          name: user.full_name || user.username,
          username: user.username,
          email: user.email,
          avatar: user.profile_image ? `${BASE_URL}${user.profile_image}` : undefined,
          status: user.status || 'Available',
          isFriend: user.is_friend || "False",
          profile_image: user.profile_image,
        }));
        setSearchResults(searchResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const handleFriendRequest = async (user: User) => {
    try {
      const success = await sendFriendRequest(user.id);
      if (success) {
        Alert.alert('Success', `Friend request sent to ${user.name}`);
        // Update user status locally
        setUsers(prev => prev.map(u => 
          u.id === user.id ? { ...u, isFriend: "Pending" } : u
        ));
        setSearchResults(prev => prev.map(u => 
          u.id === user.id ? { ...u, isFriend: "Pending" } : u
        ));
      } else {
        Alert.alert('Error', 'Failed to send friend request. Please try again.');
      }
    } catch (error) {
      console.error('Friend request error:', error);
      Alert.alert('Error', 'Failed to send friend request. Please try again.');
    }
  };

  const handleCancelRequest = async (user: User) => {
    try {
      // Find the pending request for this user
      const pendingRequest = friendRequests.find(req => 
        req.from_user_id === currentUser?.id && req.to_user === user.id && req.status === 'pending'
      );

      if (pendingRequest) {
        const success = await cancelFriendRequest(pendingRequest.id);
        if (success) {
          // Update user status locally
          setUsers(prev => prev.map(u => 
            u.id === user.id ? { ...u, isFriend: "False" } : u
          ));
          setSearchResults(prev => prev.map(u => 
            u.id === user.id ? { ...u, isFriend: "False" } : u
          ));
          Alert.alert('Success', 'Friend request cancelled');
        } else {
          Alert.alert('Error', 'Failed to cancel friend request');
        }
      }
    } catch (error) {
      console.error('Cancel request error:', error);
      Alert.alert('Error', 'Failed to cancel friend request');
    }
  };

  const handleProfileImagePress = () => {
    // Navigate to profile tab
    router.push('/profile');
    setShowMenu(false);
  };

  const handleCameraPress = async () => {
    setShowMenu(false);
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera permissions to take photos.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        
        // Save to secure store
        await SecureStore.setItemAsync('userProfileImage', imageUri);
        
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  const handleNewGroup = () => {
    setShowMenu(false);
    Alert.alert('New Group', 'Create new group feature coming soon!');
    // router.push('/new-group'); // Uncomment when you have new group screen
  };

  const handleSettings = () => {
    setShowMenu(false);
    Alert.alert('Settings', 'Settings feature coming soon!');
    // router.push('/settings'); // Uncomment when you have settings screen
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const getAvatarSource = (user: User) => {
    if (user.avatar) {
      return { uri: user.avatar };
    }
    return require('../../assets/images/default-avatar.png');
  };

  const getProfileImageSource = () => {
    if (profileImage) {
      return { uri: profileImage };
    }
    return require('../../assets/images/default-avatar.png');
  };

  const formatLastMessage = (message: string) => {
    if (!message || message === 'Start a conversation') {
      return 'Start a conversation';
    }
    if (message.length > 35) {
      return message.substring(0, 35) + '...';
    }
    return message;
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-border active:opacity-70"
      onPress={() => {
        // UPDATED: Only allow chat navigation for friends
        if (item.isFriend === "True") {
          router.push(`/chat/${item.id}`);
        }
      }}
    >
      {/* User Avatar */}
      <View className="relative">
        <View className="w-14 h-14 bg-surfaceLight rounded-full items-center justify-center overflow-hidden">
          <Image 
            source={getAvatarSource(item)}
            className="w-14 h-14 rounded-full"
            defaultSource={require('../../assets/images/default-avatar.png')}
          />
        </View>
        <View className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
          item.status === 'Online' ? 'bg-green-500' : 'bg-gray-500'
        }`} />
      </View>
      
      {/* User Info */}
      <View className="flex-1 ml-4">
        <Text className="text-white font-semibold text-base" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-text-secondary text-sm mt-1" numberOfLines={1}>
          {item.isFriend === "True" 
            ? formatLastMessage(lastMessages[item.id] || 'Start a conversation')
            : item.status || 'Available'
          }
        </Text>
      </View>
      
      {/* Action Buttons */}
      <View className="items-end">
        {/* Show Add Friend button for non-friends (only in search results) */}
        {isSearching && item.isFriend === "False" && (
          <TouchableOpacity
            className="bg-primary px-4 py-2 rounded-lg"
            onPress={() => handleFriendRequest(item)}
          >
            <Text className="text-white text-sm font-semibold">Add</Text>
          </TouchableOpacity>
        )}
        
        {/* Show Pending button for pending requests (only in search results) */}
        {isSearching && item.isFriend === "Pending" && (
          <TouchableOpacity
            className="bg-gray-500 px-4 py-2 rounded-lg"
            onPress={() => handleCancelRequest(item)}
          >
            <Text className="text-white text-sm font-semibold">Pending</Text>
          </TouchableOpacity>
        )}
        
        {/* Show chat icon for friends (always visible) */}
        {item.isFriend === "True" && (
          <View className="items-end">
            <Text className="text-text-secondary text-xs mb-1">
              {lastMessages[item.id] ? 'Now' : ''}
            </Text>
            <Ionicons name="chatbubble-outline" size={20} color="#4CAF50" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderAIItem = () => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-border active:opacity-70 bg-purple-500/10"
      onPress={() => router.push('/chat/linko')}
    >
      <View className="relative">
        <View className="w-14 h-14 bg-purple-600 rounded-full items-center justify-center">
          <Text className="text-white text-xl">🤖</Text>
        </View>
        <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
      </View>
      
      <View className="flex-1 ml-4">
        <Text className="text-white font-semibold text-base">Linko</Text>
        <Text className="text-text-secondary text-sm mt-1">
          AI Assistant - Ask me anything!
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text className="text-text-secondary mt-4">Loading chats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // UPDATED: Only show search results when searching, otherwise show friends
  const displayData = isSearching ? searchResults : filteredUsers;
  const hasFriendRequests = pendingRequestsCount > 0;
  const hasSearchResults = searchResults.length > 0;
  const hasFriends = filteredUsers.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header - WhatsApp Style */}
      <View className="bg-surface pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          {/* Left: Profile Image */}
          <TouchableOpacity 
            onPress={handleProfileImagePress}
            className="w-10 h-10 rounded-full overflow-hidden"
          >
            <Image 
              source={getProfileImageSource()}
              className="w-10 h-10 rounded-full"
              defaultSource={require('../../assets/images/default-avatar.png')}
            />
          </TouchableOpacity>

          {/* Center: App Name */}
          <View className="flex-1 items-left ml-4">
            <Text className="text-white text-xl font-bold">Link<Text className="text-primary">Up</Text></Text>
          </View>

          {/* Right: Icons */}
          <View className="flex-row items-center space-x-6 gap-3">
            {/* Camera Icon */}
            <TouchableOpacity onPress={handleCameraPress}>
              <Ionicons name="camera-outline" size={24} color="white" />
            </TouchableOpacity>

            {/* Three Dots Menu */}
            <TouchableOpacity onPress={() => setShowMenu(true)}>
              <Ionicons name="ellipsis-vertical" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-background rounded-lg px-4 py-3 mt-4">
          <Ionicons name="search" size={20} color="#666666" />
          <TextInput
            className="flex-1 text-white ml-3 text-base"
            placeholder="Search users..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666666" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Friend Requests Indicator */}
        {hasFriendRequests && (
          <TouchableOpacity 
            className="bg-primary/20 border border-primary rounded-lg p-3 mt-4 flex-row items-center"
            onPress={() => {
              Alert.alert('Friend Requests', `${pendingRequestsCount} pending requests`);
            }}
          >
            <Ionicons name="person-add" size={20} color="#4CAF50" />
            <Text className="text-primary ml-2 font-semibold flex-1">
              {pendingRequestsCount} pending friend request{pendingRequestsCount !== 1 ? 's' : ''}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
          </TouchableOpacity>
        )}
      </View>

      {/* Three Dots Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View className="absolute top-16 right-4 bg-surface rounded-lg shadow-lg min-w-48">
            <TouchableOpacity 
              className="flex-row items-center px-4 py-3 border-b border-border"
              onPress={handleNewGroup}
            >
              <Ionicons name="people-outline" size={20} color="white" />
              <Text className="text-white ml-3 text-base">New Group</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center px-4 py-3 border-b border-border"
              onPress={handleSettings}
            >
              <Ionicons name="settings-outline" size={20} color="white" />
              <Text className="text-white ml-3 text-base">Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center px-4 py-3"
              onPress={handleProfileImagePress}
            >
              <Ionicons name="person-outline" size={20} color="white" />
              <Text className="text-white ml-3 text-base">Profile</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Chat List */}
      <FlatList
        data={displayData}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* AI Assistant - Only show when not searching */}
            {!isSearching && renderAIItem()}
            
            {/* Search Results Header */}
            {isSearching && hasSearchResults && (
              <View className="px-4 py-2 bg-surfaceLight">
                <Text className="text-text-secondary text-sm font-semibold">
                  Search Results ({searchResults.length})
                </Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20 px-4">
            <Ionicons 
              name={isSearching ? "search-outline" : "people-outline"} 
              size={64} 
              color="#666666" 
            />
            <Text className="text-text-secondary text-center mt-4 text-lg font-semibold">
              {isSearching 
                ? 'No users found' 
                : 'No friends yet'
              }
            </Text>
            <Text className="text-text-secondary text-center mt-2">
              {isSearching 
                ? 'Try searching with a different name'
                : 'Search for users and send friend requests to start chatting!'
              }
            </Text>
            
            {!isSearching && !hasFriends && (
              <TouchableOpacity 
                className="bg-primary px-6 py-3 rounded-lg mt-6"
                onPress={() => setSearchQuery('a')} // Trigger search to find users
              >
                <Text className="text-white font-semibold">Find Friends</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4CAF50"
            colors={['#4CAF50']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
      />
    </SafeAreaView>
  );
}