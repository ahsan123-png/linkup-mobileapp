import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../components/auth/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.full_name || user?.username || '');
  const [status, setStatus] = useState('Available');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    'Available',
    'Busy',
    'At school',
    'At the movies',
    'At work',
    'Battery about to die',
    'Can\'t talk, WhatsApp only',
    'In a meeting',
    'At the gym',
    'Sleeping',
    'Urgent calls only'
  ];

  useEffect(() => {
    loadProfileImage();
  }, []);

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

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to change profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        await SecureStore.setItemAsync('userProfileImage', imageUri);
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (error) {
      console.error('Image pick error:', error);
      Alert.alert('Error', 'Failed to update profile picture.');
    }
  };

  const handleCameraPress = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        await SecureStore.setItemAsync('userProfileImage', imageUri);
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take picture.');
    }
  };

  const handleUpdateName = async () => {
    // if (!editedName.trim()) {
    //   Alert.alert('Error', 'Name cannot be empty.');
    //   return;
    // }

    // setLoading(true);
    // try {
    //   // Here you would typically make an API call to update the user's name
    //   // For now, we'll just update the local state
    //   if (updateUser) {
    //     await updateUser({ full_name: editedName });
    //   }
    //   setIsEditingName(false);
    //   Alert.alert('Success', 'Name updated successfully!');
    // } catch (error) {
    //   Alert.alert('Error', 'Failed to update name.');
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const getProfileImageSource = () => {
    if (profileImage) {
      return { uri: profileImage };
    }
    return require('../../assets/images/default-avatar.png');
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <Image 
          source={getProfileImageSource()}
          style={styles.avatar}
          defaultSource={require('../../assets/images/default-avatar.png')}
        />
        <TouchableOpacity 
          style={styles.cameraButton}
          onPress={() => setShowOptionsModal(true)}
        >
          <Ionicons name="camera" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.nameContainer}>
        {isEditingName ? (
          <View style={styles.nameEditContainer}>
            <TextInput
              style={styles.nameInput}
              value={editedName}
              onChangeText={setEditedName}
              autoFocus
              maxLength={50}
            />
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleUpdateName}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Ionicons name="checkmark" size={20} color="#4CAF50" />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setIsEditingName(false);
                setEditedName(user?.full_name || user?.username || '');
              }}
            >
              <Ionicons name="close" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.nameDisplayContainer}>
            <Text style={styles.userName}>
              {user?.full_name || user?.username}
            </Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditingName(true)}
            >
              <Ionicons name="create-outline" size={18} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.statusContainer}
          onPress={() => setShowStatusModal(true)}
        >
          <Text style={styles.statusText}>{status}</Text>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMenuItem = (icon: string, title: string, onPress: () => void, showArrow = true) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon as any} size={22} color="#4CAF50" />
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={16} color="#666" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        {renderProfileHeader()}

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          {renderMenuItem('lock-closed-outline', 'Privacy', () => Alert.alert('Privacy', 'Privacy settings'))}
          {renderMenuItem('key-outline', 'Security', () => Alert.alert('Security', 'Security settings'))}
          {renderMenuItem('person-outline', 'Avatar', () => Alert.alert('Avatar', 'Create or edit avatar'))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Chats</Text>
          {renderMenuItem('chatbubble-outline', 'Theme', () => Alert.alert('Theme', 'Change chat theme'))}
          {renderMenuItem('image-outline', 'Wallpapers', () => Alert.alert('Wallpapers', 'Change chat wallpapers'))}
          {renderMenuItem('archive-outline', 'Chat History', () => Alert.alert('Chat History', 'Manage chat history'))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {renderMenuItem('notifications-outline', 'Notifications', () => Alert.alert('Notifications', 'Notification settings'))}
          {renderMenuItem('cellular-outline', 'Storage and Data', () => Alert.alert('Storage', 'Storage and data settings'))}
          {renderMenuItem('accessibility-outline', 'Accessibility', () => Alert.alert('Accessibility', 'Accessibility settings'))}
          {renderMenuItem('language-outline', 'App Language', () => Alert.alert('Language', 'Change app language'))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderMenuItem('help-circle-outline', 'Help', () => Alert.alert('Help', 'Help center'))}
          {renderMenuItem('alert-circle-outline', 'Send Feedback', () => Alert.alert('Feedback', 'Send feedback'))}
          {renderMenuItem('person-add-outline', 'Invite a Friend', () => Alert.alert('Invite', 'Invite friends to LinkUp'))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Status Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Status</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {statusOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.statusOption}
                  onPress={() => {
                    setStatus(option);
                    setShowStatusModal(false);
                  }}
                >
                  <Text style={styles.statusOptionText}>{option}</Text>
                  {status === option && (
                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Image Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.imageOptionsModal}>
            <Text style={styles.modalTitle}>Update Profile Picture</Text>
            
            <TouchableOpacity 
              style={styles.imageOption}
              onPress={() => {
                setShowOptionsModal(false);
                handleCameraPress();
              }}
            >
              <Ionicons name="camera" size={24} color="#4CAF50" />
              <Text style={styles.imageOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.imageOption}
              onPress={() => {
                setShowOptionsModal(false);
                handleImagePick();
              }}
            >
              <Ionicons name="image" size={24} color="#4CAF50" />
              <Text style={styles.imageOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            {profileImage && (
              <TouchableOpacity 
                style={[styles.imageOption, styles.removeOption]}
                onPress={() => {
                  setProfileImage(null);
                  SecureStore.deleteItemAsync('userProfileImage');
                  setShowOptionsModal(false);
                  Alert.alert('Success', 'Profile picture removed!');
                }}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                <Text style={[styles.imageOptionText, styles.removeText]}>Remove Photo</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.cancelOption}
              onPress={() => setShowOptionsModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0A0A0A',
  },
  nameContainer: {
    alignItems: 'center',
  },
  nameDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  nameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 200,
    marginRight: 8,
  },
  saveButton: {
    padding: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    marginRight: 4,
  },
  cancelButton: {
    padding: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 4,
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 16,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  imageOptionsModal: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statusOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  imageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  imageOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 16,
  },
  removeOption: {
    borderBottomWidth: 0,
  },
  removeText: {
    color: '#FF3B30',
  },
  cancelOption: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#333',
    borderRadius: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
});