import api from './api';

// ==================== INTERFACES ====================

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  timeLimit?: number;
}

export interface QuizSettings {
  timeLimit: number; // minutes
  passingScore: number; // percentage
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean;
  allowRetake: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  createdBy: string | { _id: string; username: string; displayName: string };
  questions: Question[];
  settings: QuizSettings;
  isPublic: boolean;
  accessCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAnswer {
  questionIndex: number;
  selectedAnswer: number;
  timeSpent?: number;
}

export interface QuizSession {
  _id: string;
  quizId: string | Quiz;
  studentId: string;
  answers: {
    questionIndex: number;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent?: number;
  }[];
  score: number;
  correctCount: number;
  totalQuestions: number;
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  timeSpent: number;
  passed: boolean;
}

export interface QuizStatistics {
  totalAttempts: number;
  completedAttempts: number;
  passedCount: number;
  passRate: number;
  averageScore: number;
}

// ==================== TEACHER APIS ====================

class QuizService {
  // Create new quiz
  async createQuiz(data: {
    title: string;
    description?: string;
    questions: Question[];
    settings?: Partial<QuizSettings>;
    isPublic?: boolean;
  }): Promise<{ success: boolean; data: { quiz: Quiz } }> {
    const response = await api.post('/quizzes', data);
    return response.data;
  }

  // Get all quizzes created by current user
  async getMyQuizzes(): Promise<{ success: boolean; data: { quizzes: Quiz[] } }> {
    const response = await api.get('/quizzes/my-quizzes');
    return response.data;
  }

  // Get single quiz by ID
  async getQuizById(id: string): Promise<{ success: boolean; data: { quiz: Quiz; isCreator: boolean } }> {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  }

  // Update quiz
  async updateQuiz(
    id: string,
    data: {
      title?: string;
      description?: string;
      questions?: Question[];
      settings?: Partial<QuizSettings>;
      isPublic?: boolean;
    }
  ): Promise<{ success: boolean; data: { quiz: Quiz } }> {
    const response = await api.put(`/quizzes/${id}`, data);
    return response.data;
  }

  // Delete quiz
  async deleteQuiz(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  }

  // Get quiz results and statistics
  async getQuizResults(id: string): Promise<{
    success: boolean;
    data: { sessions: QuizSession[]; statistics: QuizStatistics };
  }> {
    const response = await api.get(`/quizzes/${id}/results`);
    return response.data;
  }

  // ==================== STUDENT APIS ====================

  // Join quiz with access code
  async joinQuiz(accessCode: string): Promise<{
    success: boolean;
    data: { quiz: { id: string; title: string; description?: string } };
  }> {
    const response = await api.post('/quizzes/join', { accessCode });
    return response.data;
  }

  // Start quiz session
  async startQuizSession(quizId: string): Promise<{
    success: boolean;
    data: {
      session: {
        id: string;
        quizId: string;
        title: string;
        totalQuestions: number;
        timeLimit: number;
        startedAt: string;
      };
      questions: Array<{
        index: number;
        question: string;
        options: string[];
        timeLimit?: number;
      }>;
    };
  }> {
    const response = await api.post(`/quizzes/${quizId}/start`);
    return response.data;
  }

  // Submit quiz answers
  async submitQuiz(
    quizId: string,
    data: {
      sessionId: string;
      answers: QuizAnswer[];
    }
  ): Promise<{
    success: boolean;
    data: {
      score: number;
      correctCount: number;
      totalQuestions: number;
      passed: boolean;
      timeSpent: number;
      showResults: boolean;
    };
  }> {
    const response = await api.post(`/quizzes/${quizId}/submit`, data);
    return response.data;
  }

  // Get student's quiz history
  async getMyQuizSessions(): Promise<{ success: boolean; data: { sessions: QuizSession[] } }> {
    const response = await api.get('/quizzes/my-sessions');
    return response.data;
  }
}

export const quizService = new QuizService();
