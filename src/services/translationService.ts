import api from './api';

export const translationService = {
  translate: async (text: string, to = 'vi', from = 'auto') => {
    try {
      const response = await api.post('/translate', { text, to, from });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
       console.error('Translation service error:', error);
       return {
          success: false,
          error: error.response?.data?.message || 'Lỗi kết nối dịch thuật'
       };
    }
  }
};
