export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  character_name: string;
  description?: string;
  tags: string[];
  thumbnail_url: string;
  file_count: number;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
  author?: User;
  user_vote?: 'up' | 'down' | null;
}

export interface PostFile {
  id: string;
  post_id: string;
  user_id: string;
  file_key: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  sort_order: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: User;
}

export interface Vote {
  id: string;
  post_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface PostWithFiles extends Post {
  files: PostFile[];
  comments: Comment[];
}

export interface SearchResult {
  posts: Post[];
  total: number;
  page: number;
  per_page: number;
}

export interface PresignedUploadUrl {
  upload_url: string;
  file_key: string;
  public_url: string;
}
