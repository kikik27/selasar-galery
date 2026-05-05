export interface Artwork {
  id: string;
  title: string;
  imageUrl: string;
  prompt: string;
  artistId: string;
  artistName: string;
  likesCount: number;
  copyCount: number;
  tags?: string[];
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: any;
}

export interface Report {
  id: string;
  artworkId: string;
  artworkTitle: string;
  reporterId: string;
  reason: string;
  createdAt: any;
  status: 'pending' | 'resolved';
}
