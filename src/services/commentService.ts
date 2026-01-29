import api from './api';

export interface Comment {
  _id: string;
  postId: string;
  author: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
    avatarFrame?: string;
  };
  content: string;
  parentId?: string;
  likes: string[];
  isAnonymous: boolean;
  createdAt: string;
  replies?: Comment[]; // Logic frontend tự ghép
}

export const commentService = {
  // Lấy danh sách comment của bài viết
  async getPostComments(postId: string): Promise<{
    success: boolean;
    data: Comment[];
    count: number;
  }> {
    const response = await api.get(`/comments/post/${postId}`);
    return response.data;
  },

  // Tạo comment mới
  async createComment(data: {
    postId: string;
    content: string;
    parentId?: string;
    isAnonymous?: boolean;
  }): Promise<{
    success: boolean;
    data: Comment;
  }> {
    const response = await api.post('/comments', data);
    return response.data;
  },

  // Xóa comment
  async deleteComment(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  }
};
