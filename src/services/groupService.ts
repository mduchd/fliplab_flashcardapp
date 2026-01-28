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
  settings?: {
    allowAnonymousPosts: boolean;
    requireApproval: boolean;
  };
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
  sharedFolder?: {
    _id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    setCount?: number;
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
    likes: string[];
    replies: {
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
    createdAt: string;
    isAnonymous?: boolean;
  }[];
  isPinned: boolean;
  poll?: {
    question: string;
    options: {
      _id: string;
      text: string;
      votes: string[];
    }[];
  };
  status?: 'approved' | 'pending' | 'rejected';
  isAnonymous?: boolean;
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
    settings?: {
      allowAnonymousPosts?: boolean;
      requireApproval?: boolean;
    };
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
  async getPosts(groupId: string, page = 1, status?: 'approved' | 'pending' | 'rejected'): Promise<{
    success: boolean;
    data: {
      posts: Post[];
      pagination: { page: number; limit: number; total: number; pages: number };
    };
  }> {
    let url = `/groups/${groupId}/posts?page=${page}`;
    if (status) url += `&status=${status}`;
    const response = await api.get(url);
    return response.data;
  },

  // Create post
  async createPost(groupId: string, data: {
    content: string;
    images?: string[];
    sharedFlashcardSet?: string;
    sharedFolder?: string;
    poll?: {
      question: string;
      options: string[];
    };
    isAnonymous?: boolean;
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
  async addComment(groupId: string, postId: string, content: string, isAnonymous?: boolean): Promise<{
    success: boolean;
    data: { comments: Post['comments'] };
  }> {
    const response = await api.post(`/groups/${groupId}/posts/${postId}/comments`, { content, isAnonymous });
    return response.data;
  },

  // Delete post
  async deletePost(groupId: string, postId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/groups/${groupId}/posts/${postId}`);
    return response.data;
  },

  // Toggle like on comment
  async toggleCommentLike(groupId: string, postId: string, commentId: string): Promise<{
    success: boolean;
    data: { liked: boolean; likesCount: number };
  }> {
    const response = await api.post(`/groups/${groupId}/posts/${postId}/comments/${commentId}/like`);
    return response.data;
  },

  // Add reply to comment
  async addReply(groupId: string, postId: string, commentId: string, content: string): Promise<{
    success: boolean;
    data: { replies: Post['comments'][0]['replies'] };
  }> {
    const response = await api.post(`/groups/${groupId}/posts/${postId}/comments/${commentId}/replies`, { content });
    return response.data;
  },

  // Toggle pin post
  async togglePinPost(groupId: string, postId: string): Promise<{ success: boolean; message: string; data: { isPinned: boolean } }> {
    const response = await api.post(`/groups/${groupId}/posts/${postId}/pin`);
    return response.data;
  },

  // Vote poll
  async votePoll(groupId: string, postId: string, optionIndex: number): Promise<{ success: boolean; data: { poll: Post['poll'] } }> {
    const response = await api.post(`/groups/${groupId}/posts/${postId}/vote`, { optionIndex });
    return response.data;
  },

  // Delete comment
  async deleteComment(groupId: string, postId: string, commentId: string): Promise<{ success: boolean; data: { comments: Post['comments'] } }> {
    const response = await api.delete(`/groups/${groupId}/posts/${postId}/comments/${commentId}`);
    return response.data;
  },

  // Approve post
  async approvePost(groupId: string, postId: string): Promise<{ success: boolean; data: { post: Post } }> {
    const response = await api.post(`/groups/${groupId}/posts/${postId}/approve`);
    return response.data;
  },

  // Reject post
  async rejectPost(groupId: string, postId: string): Promise<{ success: boolean; data: { post: Post } }> {
    const response = await api.post(`/groups/${groupId}/posts/${postId}/reject`);
    return response.data;
  },

  // Explore content
  async exploreContent(): Promise<{ success: boolean; data: { groups: Group[] } }> {
    const response = await api.get('/groups/explore/all');
    return response.data;
  },
};
