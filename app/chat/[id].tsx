import { API_ENDPOINTS, BASE_URL } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../components/auth/AuthContext';
import { User } from '../types';

const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_BASE_URL;

interface Message {
  id: string;
  content: string;
  sender: string;
  displaySender: string;
  media_url?: string;
  sent_at: string;
  isOptimistic?: boolean;
  sources?: any[];
}

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user: currentUser, userData } = useAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const messageCounterRef = useRef(0);
  const currentUsernameRef = useRef<string | null>(null);

  const isAI = id === 'linko';

  // Update ref when currentUser changes
  useEffect(() => {
    currentUsernameRef.current = currentUser?.username || null;
  }, [currentUser]);

  // Handle AI user
  useEffect(() => {
    if (isAI) {
      const aiUser: User = {
        id: 'linko',
        name: 'Linko',
        username: 'linko',
        email: 'ai@linkup.com',
        status: "Hi, I'm Linko! How may I assist you?",
        isFriend: "True",
        avatar: require('../../assets/images/ai.jpg'),
      };
      setUser(aiUser);
      setLoading(false);
      
      const welcomeMessage: Message = {
        id: 'welcome-1',
        content: "Hello! I'm Linko, your AI assistant. How can I help you today?",
        sender: 'Linko',
        displaySender: 'Linko',
        sent_at: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    } else if (id) {
      fetchUserData(id as string);
    }
  }, [id, isAI]);

  // Setup WebSocket when user is available
  useEffect(() => {
    if (user && !isAI && currentUser?.username) {
      setupWebSocket();
    }

    return () => {
      if (socket) {
        if ((socket as any).pingInterval) {
          clearInterval((socket as any).pingInterval);
        }
        socket.close();
      }
    };
  }, [user, isAI, currentUser]);

  // Fetch messages when user is available
  useEffect(() => {
    if (user && !isAI) {
      fetchMessages();
    }
  }, [user, isAI]);

  const generateMessageId = () => {
    messageCounterRef.current += 1;
    return `msg-${Date.now()}-${messageCounterRef.current}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const setupWebSocket = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      if (!accessToken || !currentUser?.username) {
        console.error('No access token or username available for WebSocket');
        return;
      }

      const wsUrl = `${WS_BASE_URL}/ws/chat/${currentUser.username}/?token=${accessToken}`;
      console.log('🟡 [Chat WS] Connecting to:', wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🟢 [Chat WS] Connected successfully');
        setIsConnected(true);
        
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);

        (ws as any).pingInterval = pingInterval;
      };

      ws.onmessage = (event) => {
        console.log('📨 [WS] Raw message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'pong') return;
          if (data.type === 'error') {
            console.error('❌ [WS] Server error:', data.message);
            return;
          }

          // Handle chat messages - FIXED: Better message detection
          const messageContent = data.message || data.content;
          if (messageContent !== undefined && messageContent !== null) {
            const sender = data.sender || data.from_user;
            const receiver = data.receiver || data.to_user;
            const media_url = data.media_url;
            const sent_at = data.sent_at || data.timestamp || new Date().toISOString();
            
            console.log(`📨 [WS] Processing message from ${sender} to ${receiver}`);
            
            // Skip messages from current user (handled optimistically)
            if (sender === currentUsernameRef.current) {
              console.log("🔄 [WS] Skipping own message");
              return;
            }

            // FIXED: Show messages where current user is either sender OR receiver
            // and the other participant is the user we're chatting with
            const isMessageForCurrentChat = 
              // Message sent to current user from the chat user
              (receiver === currentUsernameRef.current && sender === user?.username) ||
              // Message sent from current user to the chat user (shouldn't happen due to above filter, but just in case)
              (sender === currentUsernameRef.current && receiver === user?.username);

            if (!isMessageForCurrentChat) {
              console.log("🔄 [WS] Skipping message not for current chat:", { sender, receiver, currentUser: currentUsernameRef.current, chatUser: user?.username });
              return;
            }

            const newMsg: Message = {
              id: data.id || generateMessageId(),
              content: messageContent,
              sender: sender,
              displaySender: getDisplayName(sender),
              media_url: media_url || null,
              sent_at: sent_at,
            };
            
            setMessages(prev => {
              const existing = prev || [];
              
              // Check for duplicates by ID or content+sender+timestamp
              const isDuplicate = existing.some(msg => 
                msg.id === newMsg.id || 
                (msg.content === newMsg.content && 
                 msg.sender === newMsg.sender &&
                 Math.abs(new Date(msg.sent_at).getTime() - new Date(newMsg.sent_at).getTime()) < 2000)
              );
              
              if (isDuplicate) {
                console.log("🔄 [WS] Skipping duplicate message");
                return prev;
              }
              
              console.log("✅ [WS] Adding new message to chat");
              return [...prev, newMsg];
            });
            
            scrollToBottom();
          }
        } catch (err) {
          console.warn(`⚠️ [WS] Invalid JSON received:`, err, event.data);
        }
      };

      ws.onerror = (err) => {
        console.error('❌ [Chat WS] Error:', err);
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log(`🔴 [Chat WS] Closed`, { code: event.code, reason: event.reason });
        setIsConnected(false);
        
        if ((ws as any).pingInterval) {
          clearInterval((ws as any).pingInterval);
        }
        
        setTimeout(() => {
          if (user && !isAI && currentUser?.username) {
            console.log('🟡 [Chat WS] Attempting reconnection...');
            setupWebSocket();
          }
        }, 3000);
      };

      setSocket(ws);
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      setLoading(true);
      const accessToken = await SecureStore.getItemAsync('accessToken');
      
      let response = await fetch(`${BASE_URL}/users/get/${userId}/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('Specific user endpoint failed, trying all users...');
        response = await fetch(`${BASE_URL}/users/get/all/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const allUsers = await response.json();
          const userData = allUsers.find((u: any) => u.id.toString() === userId);
          
          if (userData) {
            const transformedUser: User = {
              id: userData.id.toString(),
              name: userData.full_name || userData.username,
              username: userData.username,
              email: userData.email,
              avatar: userData.profile_image ? `${BASE_URL}${userData.profile_image}` : undefined,
              status: userData.status || 'Available',
              isFriend: userData.is_friend || "False",
              profile_image: userData.profile_image,
            };
            setUser(transformedUser);
            return;
          }
        }
      } else {
        const userData = await response.json();
        const transformedUser: User = {
          id: userData.id.toString(),
          name: userData.full_name || userData.username,
          username: userData.username,
          email: userData.email,
          avatar: userData.profile_image ? `${BASE_URL}${userData.profile_image}` : undefined,
          status: userData.status || 'Available',
          isFriend: userData.is_friend || "False",
          profile_image: userData.profile_image,
        };
        setUser(transformedUser);
        return;
      }

      throw new Error('User not found');

    } catch (error) {
      console.error('Failed to fetch user:', error);
      Alert.alert('Error', 'Failed to load user data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!user || isAI) return;

    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.CHAT_HISTORY(user.username)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const processedMessages: Message[] = data.map((msg: any, index: number) => ({
          id: msg.id?.toString() || `history-${index}-${Date.now()}`,
          content: msg.content || msg.message || '',
          sender: msg.sender || msg.from_user,
          displaySender: getDisplayName(msg.sender || msg.from_user),
          media_url: msg.media_url || null,
          sent_at: msg.sent_at || msg.timestamp || new Date().toISOString(),
        }));
        setMessages(processedMessages);
      } else {
        console.log('Chat history endpoint failed, starting with empty messages');
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (sender: string) => {
    if (sender === currentUser?.username || sender === 'You') {
      return 'You';
    }
    if (sender === 'Linko') {
      return 'Linko';
    }
    return user?.name || sender;
  };

  const getMessageStyle = (sender: string) => {
    const isCurrentUser = sender === currentUser?.username || sender === 'You';
    const isAI = sender === 'Linko';
    
    if (isCurrentUser) {
      return { 
        backgroundColor: '#16A34A', 
        alignSelf: 'flex-end',
        marginLeft: '20%'
      };
    } else if (isAI) {
      return { 
        backgroundColor: '#374151', 
        alignSelf: 'flex-start',
        marginRight: '20%'
      };
    } else {
      return { 
        backgroundColor: '#374151', 
        alignSelf: 'flex-start',
        marginRight: '20%'
      };
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !file) return;
    if (!user) return;

    const messageId = generateMessageId();
    const messageContent = input.trim();

    if (isAI) {
      const userMessage: Message = {
        id: messageId,
        content: messageContent,
        sender: currentUser?.username || 'You',
        displaySender: 'You',
        sent_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setShowEmojiPicker(false);
      scrollToBottom();
      
      setSending(true);
      
      setTimeout(() => {
        const aiMessage: Message = {
          id: generateMessageId(),
          content: getAIResponse(messageContent),
          sender: 'Linko',
          displaySender: 'Linko',
          sent_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setSending(false);
        scrollToBottom();
      }, 1500);
      
      return;
    }

    setSending(true);
    
    const optimisticMessage: Message = {
      id: messageId,
      content: messageContent,
      sender: currentUser?.username || 'You',
      displaySender: 'You',
      media_url: file ? 'placeholder' : null,
      sent_at: new Date().toISOString(),
      isOptimistic: true
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setInput('');
    setFile(null);
    scrollToBottom();

    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const formData = new FormData();
      formData.append("receiver_username", user.username);
      
      if (messageContent) {
        formData.append("content", messageContent);
      }
      
      if (file) {
        formData.append("media", file);
      }

      console.log('📤 Sending message to:', `${BASE_URL}${API_ENDPOINTS.SEND_MESSAGE}`);
      
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.SEND_MESSAGE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Send message failed:', errorText);
        throw new Error("Failed to send message");
      }

      const responseData = await response.json();
      console.log('✅ Message sent successfully:', responseData);

      setMessages(prev => prev.map(msg =>
        msg.id === messageId && msg.isOptimistic
          ? {
              ...responseData.data,
              id: responseData.data.id || messageId,
              sender: currentUser?.username || 'You',
              displaySender: 'You',
              media_url: responseData.data.media_url || msg.media_url
            }
          : msg
      ));

    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => prev.filter(msg => !(msg.id === messageId && msg.isOptimistic)));
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getAIResponse = (userMessage: string) => {
    const responses = [
      `I understand you're saying: "${userMessage}". How can I assist you further?`,
      `Thanks for your message! Regarding "${userMessage}", I'm here to help. What would you like to know?`,
      `I've received your query about "${userMessage}". Is there anything specific you'd like me to explain?`,
      `That's interesting! About "${userMessage}" - how can I provide more information?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleFilePick = async () => {
    Alert.alert('Coming Soon', 'File attachment feature will be available soon!');
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const messageStyle = getMessageStyle(item.sender);
    const isAIMessage = item.sender === 'Linko';
    const isCurrentUser = item.sender === currentUser?.username || item.sender === 'You';

    return (
      <View 
        style={[
          {
            maxWidth: '80%',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 20,
            marginVertical: 4,
            marginHorizontal: 16,
          },
          messageStyle
        ]}
      >
        {!isCurrentUser && (
          <Text style={{ color: '#D1D5DB', fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
            {item.displaySender}
            {isAIMessage && " 🤖"}
          </Text>
        )}
        
        <Text style={{ color: 'white', fontSize: 16, lineHeight: 20 }}>
          {item.content}
        </Text>

        {item.media_url && item.media_url !== 'placeholder' && (
          <View style={{ marginTop: 8 }}>
            <Image 
              source={{ uri: item.media_url }}
              style={{ width: 200, height: 150, borderRadius: 12 }}
              resizeMode="cover"
            />
          </View>
        )}

        <Text style={{ 
          color: '#9CA3AF', 
          fontSize: 12, 
          textAlign: isCurrentUser ? 'right' : 'left', 
          marginTop: 4 
        }}>
          {new Date(item.sent_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
          {item.isOptimistic && ' • Sending...'}
        </Text>
      </View>
    );
  };

  const getAvatarSource = () => {
    if (isAI) {
      return require('../../assets/images/ai.jpg');
    }
    if (user?.avatar) {
      return { uri: user.avatar };
    }
    return require('../../assets/images/default-avatar.png');
  };

  if (loading && !isAI) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ color: '#A0A0A0', marginTop: 16 }}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user && !isAI) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#A0A0A0', fontSize: 18 }}>User not found</Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#4CAF50', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16 }}
            onPress={() => router.back()}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <View style={{ 
        backgroundColor: '#1A1A1A', 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        flexDirection: 'row', 
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#333333'
      }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={{ position: 'relative' }}>
          <Image 
            source={getAvatarSource()}
            style={{ width: 40, height: 40, borderRadius: 20 }}
            defaultSource={require('../../assets/images/default-avatar.png')}
          />
          {!isAI && (
            <View style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: isConnected ? '#10B981' : '#EF4444',
              borderWidth: 2,
              borderColor: '#1A1A1A'
            }} />
          )}
        </View>
        
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>
            {user?.name}
          </Text>
          <Text style={{ color: '#A0A0A0', fontSize: 14 }}>
            {user?.status || (isAI ? 'AI Assistant' : isConnected ? 'Online' : 'Connecting...')}
          </Text>
        </View>

        {!isAI && (
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableOpacity>
              <Ionicons name="call-outline" size={24} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="videocam-outline" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          ListEmptyComponent={
            !isAI && !loading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
                <Ionicons name="chatbubble-outline" size={64} color="#666666" />
                <Text style={{ color: '#A0A0A0', textAlign: 'center', marginTop: 16, fontSize: 18, fontWeight: '600' }}>
                  No messages yet
                </Text>
                <Text style={{ color: '#A0A0A0', textAlign: 'center', marginTop: 8 }}>
                  Start a conversation with {user?.name}
                </Text>
                {!isConnected && (
                  <Text style={{ color: '#EF4444', textAlign: 'center', marginTop: 8, fontSize: 12 }}>
                    Connecting to chat...
                  </Text>
                )}
              </View>
            ) : null
          }
        />

        <View style={{ 
          backgroundColor: '#1A1A1A', 
          borderTopWidth: 1, 
          borderTopColor: '#333333',
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'flex-end'
        }}>
          <TouchableOpacity 
            style={{ padding: 8, marginRight: 8 }}
            onPress={handleFilePick}
          >
            <Ionicons name="attach-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={{ 
              flex: 1, 
              backgroundColor: '#0A0A0A', 
              color: 'white', 
              borderRadius: 24, 
              paddingHorizontal: 16, 
              paddingVertical: 12,
              marginRight: 8,
              maxHeight: 100,
              minHeight: 48
            }}
            placeholder={`Message ${user?.name}...`}
            placeholderTextColor="#666666"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            editable={!sending && (isAI || isConnected)}
          />

          <TouchableOpacity
            style={{ 
              backgroundColor: '#4CAF50', 
              borderRadius: 24, 
              width: 48, 
              height: 48, 
              alignItems: 'center', 
              justifyContent: 'center',
              opacity: (sending || !input.trim()) ? 0.5 : 1
            }}
            onPress={handleSend}
            disabled={sending || !input.trim()}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons 
                name="send" 
                size={20} 
                color="white"
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}