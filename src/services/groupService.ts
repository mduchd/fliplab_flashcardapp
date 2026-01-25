import api from './api';

export interface Group {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  coverImage?: string;
  createdBy: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  admins: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
  }[];
  members: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
  }[];
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  groupId: string;
  author: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  content: string;
  images: string[];
  sharedFlashcardSet?: {
    _id: string;
    name: string;
    description?: string;
    cards: any[];
    color: string;
  };
  likes: string[];
  comments: {
    _id: string;
    author: {
      _id: string;
      username: string;
      displayName: string;
      avatar?: string;
    };
    content: string;
    createdAt: string;
  }[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export const groupService = {
  // Get all groups
  async getGroups(filter?: 'my' | 'created', search?: string): Promise<{ success: boolean; data: { groups: Group[] } }> {
    const params = new URLSearchParams();
    if (filter) params.append('filter', filter);
    if (search) params.append('search', search);
    const response = await api.get(`/groups?${params.toString()}`);
    return response.data;
  },

  // Get single group
  async getGroup(id: string): Promise<{ success: boolean; data: { group: Group } }> {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  // Create group
  async createGroup(data: {
    name: string;
    description?: string;
    image?: string;
    isPublic?: boolean;
    tags?: string[];
  }): Promise<{ success: boolean; data: { group: Group } }> {
    const response = await api.post('/groups', data);
    return response.data;
  },

  // Update group
  async updateGroup(id: string, data: {
    name?: string;
    description?: string;
    image?: string;
    coverImage?: string;
    isPublic?: boolean;
    tags?: string[];
  }): Promise<{ success: boolean; data: { group: Group } }> {
    const response = await api.put(`/groups/${id}`, data);
    return response.data;
  },

  // Delete group
  async deleteGroup(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/groups/${id}`);
    return response.data;
  },

  // Join group
  async joinGroup(id: string): Promise<{ success: boolean }> {
    const response = await api.post(`/groups/${id}/join`);
    return response.data;
  },

  // Leave group
  async leaveGroup(id: string): Promise<{ success: boolean }> {
    const response = await api.post(`/groups/${id}/leave`);
    return response.data;
  },

  // Get posts in group
  async getPosts(groupId: string, page = 1): Promise<{
    success: boolean;
    data: {
      posts: Post[];
      pagination: { page: number; limit: number; total: number; pages: number };
    };
  }> {
    const response = await api.get(`/groups/${groupId}/posts?page=${page}`);
    return response.data;
  },

  // Create post
  async createPost(groupId: string, data: {
    content: string;
    images?: string[];
    sharedFlashcardSet?: string;
  }): Promise<{ success: boolean; data: { post: Post } }> {
    const response = await api.post(`/groups/${groupId}/posts`, data);
    return response.data;
  },

  // Toggle like on post
  async toggleLike(groupId: string, postId: string): Promise<{
    success: boolean;
    data: { liked: boolean; likesCount: number };
  }> {
    const response = await api.post(`/groups/${groupId}/posts/${postId}/like`);
    return response.data;
  },

  // Add comment
  async addComment(groupId: string, postId: string, content: string): Promise<{
    success: boolean;
    data: { comments: Post['comments'] };
  }> {
    const response = await api.post(`/groups/${groupId}/posts/${postId}/comments`, { content });
    return response.data;
  },

  // Delete post
  async deletePost(groupId: string, postId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/groups/${groupId}/posts/${postId}`);
    return response.data;
  },
};
