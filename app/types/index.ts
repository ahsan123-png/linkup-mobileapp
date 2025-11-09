export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar?: string;
  status: string;
  isFriend: "True" | "False" | "Pending";
  lastMessage?: string;
  lastMessageTime?: string;
  profile_image?: string;
}

export interface FriendRequest {
  id: string;
  from_user: string;
  from_user_id: string;
  from_user_name: string;
  from_user_avatar?: string;
  to_user: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  displaySender?: string;
  media_url?: string;
  sent_at: string;
  isOptimistic?: boolean;
  is_read?: boolean;
}

export interface Chat {
  userId: string;
  user: User;
  messages: Message[];
  unreadCount: number;
}