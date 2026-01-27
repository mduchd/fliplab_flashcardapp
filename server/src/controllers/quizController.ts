import { Response } from 'express';
import { Quiz, IQuiz, IQuestion } from '../models/Quiz.js';
import { QuizSession, IQuizSession } from '../models/QuizSession.js';
import { AuthRequest } from '../middleware/auth.js';
import crypto from 'crypto';

// ==================== TEACHER APIs ====================

// @desc    Create new quiz
// @route   POST /api/quizzes
// @access  Private (Teacher)
export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, questions, settings, isPublic } = req.body;

    // Validation
    if (!title || !questions || questions.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Title and at least one question are required',
      });
      return;
    }

    // Validate each question has 4 options
    for (const q of questions) {
      if (!q.question || !q.options || q.options.length !== 4 || q.correctAnswer === undefined) {
        res.status(400).json({
          success: false,
          message: 'Each question must have a question text, 4 options, and a correct answer',
        });
        return;
      }
    }

    // Generate access code for private quizzes
    const accessCode = !isPublic ? crypto.randomBytes(4).toString('hex').toUpperCase() : undefined;

    const quiz = await Quiz.create({
      title,
      description,
      createdBy: req.userId,
      questions,
      settings: settings || {},
      isPublic: isPublic || false,
      accessCode,
    });

    res.status(201).json({
      success: true,
      data: { quiz },
    });
  } catch (error: any) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create quiz',
    });
  }
};

// @desc    Get all quizzes created by teacher
// @route   GET /api/quizzes/my-quizzes
// @access  Private (Teacher)
export const getMyQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.userId })
      .sort({ createdAt: -1 })
      .select('-questions.correctAnswer'); // Hide correct answers in list

    res.json({
      success: true,
      data: { quizzes },
    });
  } catch (error: any) {
    console.error('Get my quizzes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch quizzes',
    });
  }
};

// @desc    Get single quiz (full details for teacher)
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuizById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'username displayName');

    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
      return;
    }

    // If user is not the creator, hide correct answers
    const isCreator = quiz.createdBy._id.toString() === req.userId;
    const quizData = quiz.toObject();

    if (!isCreator) {
      quizData.questions = quizData.questions.map((q: IQuestion) => ({
        question: q.question,
        options: q.options,
        timeLimit: q.timeLimit,
        // correctAnswer hidden
      }));
    }

    res.json({
      success: true,
      data: { quiz: quizData, isCreator },
    });
  } catch (error: any) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch quiz',
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Teacher - only creator)
export const updateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
      return;
    }

    // Check ownership
    if (quiz.createdBy.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this quiz',
      });
      return;
    }

    const { title, description, questions, settings, isPublic } = req.body;

    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (questions) quiz.questions = questions;
    if (settings) quiz.settings = { ...quiz.settings, ...settings };
    if (isPublic !== undefined) quiz.isPublic = isPublic;

    await quiz.save();

    res.json({
      success: true,
      data: { quiz },
    });
  } catch (error: any) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update quiz',
    });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Teacher - only creator)
export const deleteQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
      return;
    }

    // Check ownership
    if (quiz.createdBy.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this quiz',
      });
      return;
    }

    await quiz.deleteOne();

    // Also delete all sessions for this quiz
    await QuizSession.deleteMany({ quizId: req.params.id });

    res.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete quiz',
    });
  }
};

// @desc    Get quiz results/statistics for teacher
// @route   GET /api/quizzes/:id/results
// @access  Private (Teacher - only creator)
export const getQuizResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
      return;
    }

    // Check ownership
    if (quiz.createdBy.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view these results',
      });
      return;
    }

    const sessions = await QuizSession.find({ quizId: req.params.id })
      .populate('studentId', 'username displayName email')
      .sort({ completedAt: -1 });

    // Calculate statistics
    const totalAttempts = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const passedCount = completedSessions.filter(s => s.passed).length;
    const averageScore = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + s.score, 0) / completedSessions.length
      : 0;

    res.json({
      success: true,
      data: {
        sessions,
        statistics: {
          totalAttempts,
          completedAttempts: completedSessions.length,
          passedCount,
          passRate: completedSessions.length > 0 ? (passedCount / completedSessions.length) * 100 : 0,
          averageScore: Math.round(averageScore * 10) / 10,
        },
      },
    });
  } catch (error: any) {
    console.error('Get quiz results error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch quiz results',
    });
  }
};

// ==================== STUDENT APIs ====================

// @desc    Join quiz with access code
// @route   POST /api/quizzes/join
// @access  Private (Student)
export const joinQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { accessCode } = req.body;

    if (!accessCode) {
      res.status(400).json({
        success: false,
        message: 'Access code is required',
      });
      return;
    }

    const quiz = await Quiz.findOne({ accessCode: accessCode.toUpperCase() });

    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Invalid access code',
      });
      return;
    }

    res.json({
      success: true,
      data: { quiz: { id: quiz._id, title: quiz.title, description: quiz.description } },
    });
  } catch (error: any) {
    console.error('Join quiz error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to join quiz',
    });
  }
};

// @desc    Start quiz session
// @route   POST /api/quizzes/:id/start
// @access  Private (Student)
export const startQuizSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
      return;
    }

    // Check if student already has an in-progress session
    const existingSession = await QuizSession.findOne({
      quizId: req.params.id,
      studentId: req.userId,
      status: 'in-progress',
    });

    if (existingSession) {
      res.status(400).json({
        success: false,
        message: 'You already have an active session for this quiz',
        data: { sessionId: existingSession._id },
      });
      return;
    }

    // Check if retakes are allowed
    if (!quiz.settings.allowRetake) {
      const completedSession = await QuizSession.findOne({
        quizId: req.params.id,
        studentId: req.userId,
        status: 'completed',
      });

      if (completedSession) {
        res.status(400).json({
          success: false,
          message: 'Retakes are not allowed for this quiz',
        });
        return;
      }
    }

    // Create new session
    const session = await QuizSession.create({
      quizId: req.params.id,
      studentId: req.userId,
      totalQuestions: quiz.questions.length,
      startedAt: new Date(),
    });

    // Prepare questions (shuffle if needed)
    let questions = quiz.questions.map((q, index) => ({
      index,
      question: q.question,
      options: q.options,
      timeLimit: q.timeLimit,
    }));

    if (quiz.settings.shuffleQuestions) {
      questions = shuffleArray(questions);
    }

    if (quiz.settings.shuffleOptions) {
      questions = questions.map(q => ({
        ...q,
        options: shuffleArray(q.options),
      }));
    }

    res.status(201).json({
      success: true,
      data: {
        session: {
          id: session._id,
          quizId: quiz._id,
          title: quiz.title,
          totalQuestions: quiz.questions.length,
          timeLimit: quiz.settings.timeLimit,
          startedAt: session.startedAt,
        },
        questions,
      },
    });
  } catch (error: any) {
    console.error('Start quiz session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start quiz session',
    });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
export const submitQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId, answers } = req.body;

    if (!sessionId || !answers) {
      res.status(400).json({
        success: false,
        message: 'Session ID and answers are required',
      });
      return;
    }

    const session = await QuizSession.findById(sessionId);
    const quiz = await Quiz.findById(req.params.id);

    if (!session || !quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz session not found',
      });
      return;
    }

    // Verify ownership
    if (session.studentId.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    if (session.status !== 'in-progress') {
      res.status(400).json({
        success: false,
        message: 'This session is already completed or abandoned',
      });
      return;
    }

    // Grade answers
    let correctCount = 0;
    const gradedAnswers = answers.map((answer: any) => {
      const question = quiz.questions[answer.questionIndex];
      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) correctCount++;

      return {
        questionIndex: answer.questionIndex,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeSpent: answer.timeSpent || 0,
      };
    });

    const score = (correctCount / quiz.questions.length) * 100;
    const passed = score >= quiz.settings.passingScore;
    const timeSpent = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);

    // Update session
    session.answers = gradedAnswers;
    session.score = Math.round(score * 10) / 10;
    session.correctCount = correctCount;
    session.status = 'completed';
    session.completedAt = new Date();
    session.timeSpent = timeSpent;
    session.passed = passed;
    await session.save();

    res.json({
      success: true,
      data: {
        score: session.score,
        correctCount,
        totalQuestions: quiz.questions.length,
        passed,
        timeSpent,
        showResults: quiz.settings.showResults,
      },
    });
  } catch (error: any) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit quiz',
    });
  }
};

// @desc    Get student's quiz history
// @route   GET /api/quizzes/my-sessions
// @access  Private (Student)
export const getMyQuizSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await QuizSession.find({ studentId: req.userId })
      .populate('quizId', 'title description')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { sessions },
    });
  } catch (error: any) {
    console.error('Get my sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch quiz sessions',
    });
  }
};

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
