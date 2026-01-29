import api from './api';

export interface GeneratedCard {
  term: string;
  definition: string;
}

export interface AIResponse {
  suggestions: GeneratedCard[];
  isMock?: boolean;
}

export const aiService = {
  // Generate cards from topic or prompt
  generateFlashcards: async (prompt: string, count: number = 10): Promise<AIResponse> => {
    // If input is short (< 50 chars), treat it as a Topic, otherwise as Prompt Context
    const payload = prompt.length < 50 
        ? { topic: prompt, count } 
        : { prompt, count };
        
    const response = await api.post('/ai/generate', payload);
    return response.data;
  },
};
