import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizService, QuizAnswer } from '../../services/quizService';
import MainLayout from '../../components/layout/MainLayout';
import { HiClock, HiFlag } from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';
import './TakeQuiz.css';

interface QuizQuestion {
  index: number;
  question: string;
  options: string[];
  timeLimit?: number;
}

interface SessionData {
  id: string;
  quizId: string;
  title: string;
  totalQuestions: number;
  timeLimit: number;
  startedAt: string;
}

const TakeQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { id: quizId } = useParams<{ id: string }>();
  const toast = useToastContext();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const questionStartTimeRef = useRef<number>(Date.now());
  const questionTimesRef = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    if (quizId) {
      startQuiz();
    }
  }, [quizId]);

  // Timer
  useEffect(() => {
    if (!session || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session, timeRemaining]);

  // Track time per question
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [currentQuestionIndex]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      const response = await quizService.startQuizSession(quizId!);
      
      setSession(response.data.session);
      setQuestions(response.data.questions);
      
      // Calculate time remaining in seconds
      const startTime = new Date(response.data.session.startedAt).getTime();
      const limitMs = response.data.session.timeLimit * 60 * 1000;
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.floor((limitMs - elapsed) / 1000));
      
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        toast.error('Time expired');
        navigate('/quiz/join');
      }
    } catch (error: any) {
      console.error('Failed to start quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to start quiz');
      navigate('/quiz/join');
    } finally {
      setLoading(false);
    }
  };

  const saveQuestionTime = (questionIndex: number) => {
    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    questionTimesRef.current.set(questionIndex, timeSpent);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestionIndex, optionIndex);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    saveQuestionTime(currentQuestionIndex);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    saveQuestionTime(currentQuestionIndex);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionJump = (index: number) => {
    saveQuestionTime(currentQuestionIndex);
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = () => {
    setSubmitModalOpen(true);
  };

  const handleAutoSubmit = async () => {
    toast.info('Time expired! Submitting your answers...');
    await confirmSubmit();
  };

  const confirmSubmit = async () => {
    if (!session) return;

    try {
      setSubmitting(true);
      saveQuestionTime(currentQuestionIndex);

      // Build answers array
      const quizAnswers: QuizAnswer[] = questions.map((q, index) => ({
        questionIndex: q.index,
        selectedAnswer: answers.get(index) ?? 0,
        timeSpent: questionTimesRef.current.get(index) || 0,
      }));

      const response = await quizService.submitQuiz(quizId!, {
        sessionId: session.id,
        answers: quizAnswers,
      });

      toast.success('Quiz submitted successfully!');
      
      // Navigate to results
      navigate(`/quiz/results/${session.id}`, {
        state: { resultData: response.data },
      });
    } catch (error: any) {
      console.error('Failed to submit quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
      setSubmitModalOpen(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (): string => {
    if (timeRemaining > 300) return '#10b981'; // green
    if (timeRemaining > 60) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Starting quiz...</p>
        </div>
      </MainLayout>
    );
  }

  if (!session || questions.length === 0) {
    return (
      <MainLayout>
        <div className="error-container">
          <p>Quiz not found</p>
          <button className="btn-primary" onClick={() => navigate('/quiz/join')}>
            Back to Join Quiz
          </button>
        </div>
      </MainLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = answers.size;

  return (
    <MainLayout>
      <div className="take-quiz-container">
        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-info">
            <h1 className="quiz-title">{session.title}</h1>
            <div className="quiz-progress">
              <span className="progress-text">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
          
          <div className="timer" style={{ borderColor: getTimeColor() }}>
            <HiClock className="timer-icon" style={{ color: getTimeColor() }} />
            <span className="timer-text" style={{ color: getTimeColor() }}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="quiz-content">
          {/* Question */}
          <div className="question-card">
            <div className="question-header">
              <span className="question-label">Question {currentQuestionIndex + 1}</span>
            </div>
            <h2 className="question-text">{currentQuestion.question}</h2>
          </div>

          {/* Options */}
          <div className="options-grid">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers.get(currentQuestionIndex) === index;
              const letter = String.fromCharCode(65 + index);

              return (
                <button
                  key={index}
                  className={`option-button ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="option-letter">{letter}</div>
                  <div className="option-text">{option}</div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="quiz-navigation">
            <button
              className="btn-secondary"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                className="btn-success"
                onClick={handleSubmit}
                disabled={submitting}
              >
                <HiFlag className="icon" />
                Submit Quiz
              </button>
            ) : (
              <button className="btn-primary" onClick={handleNext}>
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="question-navigator">
          <h3 className="navigator-title">Questions</h3>
          <p className="navigator-subtitle">{answeredCount} / {questions.length} answered</p>
          
          <div className="question-grid">
            {questions.map((_, index) => {
              const isAnswered = answers.has(index);
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={index}
                  className={`question-btn ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}`}
                  onClick={() => handleQuestionJump(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        <ConfirmModal
          isOpen={submitModalOpen}
          onCancel={() => setSubmitModalOpen(false)}
          onConfirm={confirmSubmit}
          title="Submit Quiz"
          message={`You have answered ${answeredCount} out of ${questions.length} questions. Are you sure you want to submit?`}
          confirmText="Submit"
          cancelText="Continue Quiz"
          variant="info"
        />
      </div>
    </MainLayout>
  );
};

export default TakeQuiz;
