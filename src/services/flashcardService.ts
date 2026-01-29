import api from './api';

export interface Flashcard {
  _id?: string;
  term: string;
  definition: string;
  image?: string;
  starred: boolean;
  box: number;
  nextReview?: string;
}

export interface FlashcardSet {
  _id: string;
  name: string;
  description?: string;
  cards: Flashcard[];
  cardCount?: number; // Optional: returned when cards array is excluded
  userId: string;
  isPublic: boolean;
  tags: string[];
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  lastStudied?: string;
  totalStudies: number;
  folderId?: string;
}

export interface CreateFlashcardSetData {
  name: string;
  description?: string;
  cards: Omit<Flashcard, '_id'>[];
  isPublic?: boolean;
  tags?: string[];
  color?: string;
  icon?: string;
}

export const flashcardService = {
  // Get all flashcard sets
  async getAll(search?: string, tags?: string): Promise<{ success: boolean; data: { flashcardSets: FlashcardSet[] } }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tags) params.append('tags', tags);
    
    const response = await api.get(`/flashcards?${params.toString()}`);
    return response.data;
  },

  // Get single flashcard set
  async getById(id: string): Promise<{ success: boolean; data: { flashcardSet: FlashcardSet } }> {
    const response = await api.get(`/flashcards/${id}`);
    return response.data;
  },

  // Create new flashcard set
  async create(data: CreateFlashcardSetData): Promise<{ success: boolean; data: { flashcardSet: FlashcardSet } }> {
    const response = await api.post('/flashcards', data);
    return response.data;
  },

  // Update flashcard set
  async update(id: string, data: Partial<CreateFlashcardSetData>): Promise<{ success: boolean; data: { flashcardSet: FlashcardSet } }> {
    const response = await api.put(`/flashcards/${id}`, data);
    return response.data;
  },

  // Delete flashcard set
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/flashcards/${id}`);
    return response.data;
  },

  // Update study progress
  async updateStudyProgress(id: string, cardId: string, box: number): Promise<{ success: boolean; data: { flashcardSet: FlashcardSet } }> {
    const response = await api.post(`/flashcards/${id}/study`, { cardId, box });
    return response.data;
  },
};
