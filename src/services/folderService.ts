import api from './api';

export interface Folder {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  setCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const folderService = {
  // Get all folders
  async getFolders(): Promise<{ success: boolean; data: { folders: Folder[] } }> {
    const response = await api.get('/folders');
    return response.data;
  },

  // Get single folder with its flashcard sets
  async getFolder(id: string): Promise<{ success: boolean; data: { folder: Folder; flashcardSets: any[] } }> {
    const response = await api.get(`/folders/${id}`);
    return response.data;
  },

  // Create folder
  async createFolder(data: { name: string; description?: string; color?: string; icon?: string }): Promise<{ success: boolean; data: { folder: Folder } }> {
    const response = await api.post('/folders', data);
    return response.data;
  },

  // Update folder
  async updateFolder(id: string, data: { name?: string; description?: string; color?: string; icon?: string }): Promise<{ success: boolean; data: { folder: Folder } }> {
    const response = await api.put(`/folders/${id}`, data);
    return response.data;
  },

  // Delete folder
  async deleteFolder(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/folders/${id}`);
    return response.data;
  },

  // Move flashcard set to folder
  async moveSetToFolder(folderId: string, setId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/folders/${folderId}/sets/${setId}`);
    return response.data;
  },

  // Remove flashcard set from folder
  async removeSetFromFolder(setId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/folders/none/sets/${setId}`);
    return response.data;
  },
};
