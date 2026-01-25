import api from './api';

export interface ImportPreviewResponse {
  success: boolean;
  data?: {
    fileName: string;
    totalCards: number;
    preview: { term: string; definition: string }[];
    rawTextPreview: string;
  };
  message?: string;
}

export interface ImportResponse {
  success: boolean;
  message: string;
  data?: {
    flashcardSet: any;
    cardsCount: number;
    preview: { term: string; definition: string }[];
  };
  hint?: string;
}

export const importService = {
  // Preview file content before importing
  async previewFile(file: File): Promise<ImportPreviewResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/import/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Import file and create flashcard set
  async importFile(
    file: File,
    options: {
      name?: string;
      description?: string;
      tags?: string[];
      color?: string;
    }
  ): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.name) formData.append('name', options.name);
    if (options.description) formData.append('description', options.description);
    if (options.tags) formData.append('tags', options.tags.join(','));
    if (options.color) formData.append('color', options.color);

    const response = await api.post('/import/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
