

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  profileImage?: string;
  bannerUrl?: string;
  bio?: string;
  role: 'explorer' | 'artist' | 'company' | 'admin';
  isArtist: boolean;
  isOrganization?: boolean;
  isTrending?: boolean;
  trendingUntil?: string;
  upiId?: string;
  organizationInfo?: {
    name: string;
    description?: string;
    website?: string;
    industry?: string;
    size?: string;
    verified?: boolean;
  };
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
    artstation?: string;
  };
  categories?: string[];
  badges?: string[];
  followers?: { id: string; username: string; avatar?: string; bio?: string }[];
  following?: { id: string; username: string; avatar?: string; bio?: string }[];
  followersCount?: number;
  followingCount?: number;
  patronTiers?: {
    _id?: string;
    name: string;
    price: number;
    description: string;
    perks: string[];
  }[];
  patronsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Artist extends User {
  portfolio: string[];
  categories: string[];
  verified?: boolean;
}

export interface Artwork {
  id: string;
  title: string;
  description?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  category: string;
  style?: string;
  techniques?: string[];
  artist: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  creatorId?: string;
  creator?: User;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  isSaved?: boolean;
  views?: number;
  votes?: number;
  trendVotes?: number;
  isTrended?: boolean;
  isForSale?: boolean;
  price?: number;
  tags?: string[];
  collaborators?: any[];
  mediaUrls?: string[];
}

export interface ArtworkCardProps {
  id: string;
  title: string;
  artist: {
    name: string;
    username: string;
    avatar?: string;
  };
  imageUrl: string;
  category: string;
  likes: number;
  comments: number;
  trendVotes: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isTrended?: boolean;
  isForSale?: boolean;
  price?: number;
  onLike?: (id: string) => void;
  onSave?: (id: string) => void;
  onTrend?: (id: string) => void;
  mediaUrls?: string[];
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  prize: string;
  deadline: string;
  participants: number;
  status: 'upcoming' | 'active' | 'completed';
  bannerUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: {
    id: string;
    username: string;
    profileImage?: string;
  };
  content: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file' | 'gif' | 'sticker' | 'commission' | 'voice' | 'media';
  mediaUrl?: string;
  timestamp: string;
  readBy: string[];
}

export interface Chat {
  id: string;
  participants: Array<{
    id: string;
    username: string;
    profileImage?: string;
  }>;
  messages: ChatMessage[];
  lastMessage: string;
  lastMessageTime: string;
  isGroup: boolean;
  groupName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'competition' | 'gallery_event' | 'follow';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  artworkId?: string;
  relatedUserId?: string;
}