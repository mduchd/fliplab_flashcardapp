import api from './api';

export interface FollowUser {
  _id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  avatarFrame?: string;
}

export const followService = {
  // Follow a user
  async follow(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  // Unfollow a user
  async unfollow(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  },

  // Get follow status
  async getFollowStatus(userId: string): Promise<{ success: boolean; data: { isFollowing: boolean } }> {
    const response = await api.get(`/users/${userId}/follow/status`);
    return response.data;
  },

  // Get followers list
  async getFollowers(userId: string): Promise<{ success: boolean; data: { followers: FollowUser[]; count: number } }> {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },

  // Get following list
  async getFollowing(userId: string): Promise<{ success: boolean; data: { following: FollowUser[]; count: number } }> {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  },
};
