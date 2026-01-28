import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizService, QuizAnswer, Quiz } from '../../services/quizService';
import MainLayout from '../../components/layout/MainLayout';
import { HiClock, HiFlag, HiArrowLeft, HiArrowRight } from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';
import { dailyProgressTracker } from '../../utils/dailyProgressTracker';
import ConfirmModal from '../../components/ConfirmModal';

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
        toast.error('Hết giờ');
        navigate('/quiz/join');
      }
    } catch (error: any) {
      console.error('Failed to start quiz:', error);
      const msg = error.response?.data?.message || JSON.stringify(error.response?.data) || '';
      
      // Handle Duplicate Session (Resume Logic)
      if (msg.includes('active session') || msg.includes('E11000') || msg.includes('duplicate key')) {
        try {
          toast.info('Phát hiện bài thi đang làm dở, đang khôi phục...');
          
          // 1. Get Active Session ID
          const sessionsRes = await quizService.getMyQuizSessions();
          const activeSession = sessionsRes.data.sessions.find(s => {
             const sQuizId = typeof s.quizId === 'string' ? s.quizId : s.quizId._id;
             return sQuizId === quizId && s.status === 'in-progress';
          });

          if (activeSession) {
             // 2. Get Quiz Details (Questions & Settings)
             const quizRes = await quizService.getQuizById(quizId!);
             const quiz = quizRes.data.quiz;

             // 3. Reconstruct State
             const mappedQuestions: QuizQuestion[] = quiz.questions.map((q, idx) => ({
               index: idx,
               question: q.question,
               options: q.options,
               timeLimit: q.timeLimit
             }));

             const restoredSession: SessionData = {
               id: activeSession._id,
               quizId: quizId!,
               title: quiz.title,
               totalQuestions: quiz.questions.length,
               timeLimit: quiz.settings.timeLimit,
               startedAt: activeSession.startedAt
             };

             setSession(restoredSession);
             setQuestions(mappedQuestions);

             // 4. Restore Answers
             if (activeSession.answers && activeSession.answers.length > 0) {
                const restoredAnswers = new Map<number, number>();
                activeSession.answers.forEach(a => {
                   restoredAnswers.set(a.questionIndex, a.selectedAnswer);
                });
                setAnswers(restoredAnswers);
             }

             // Recalculate time
             const startTime = new Date(activeSession.startedAt).getTime();
             const limitMs = quiz.settings.timeLimit * 60 * 1000;
             const elapsed = Date.now() - startTime;
             const remaining = Math.max(0, Math.floor((limitMs - elapsed) / 1000));
             setTimeRemaining(remaining);

             toast.success('Đã khôi phục bài thi!');
             return; 
          }
        } catch (resumeError) {
          console.error('Resume failed:', resumeError);
        }
      }

      toast.error('Không thể bắt đầu bài thi. ' + (msg.includes('E11000') ? 'Bạn đã có phiên làm bài.' : ''));
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
    toast.info('Hết giờ! Đang nộp bài...');
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

      // Update daily progress based on correct answers
      if (response.data?.correctCount !== undefined) {
        dailyProgressTracker.incrementProgress(response.data.correctCount);
      }

      toast.success('Nộp bài thành công!');
      
      // Navigate to results
      navigate(`/quiz/results/${session.id}`, {
        state: { resultData: response.data },
      });
    } catch (error: any) {
      console.error('Failed to submit quiz:', error);
      toast.error(error.response?.data?.message || 'Nộp bài thất bại');
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

  const getTimeColorClass = (): string => {
    if (timeRemaining > 300) return 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20';
    if (timeRemaining > 60) return 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20';
    return 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 animate-pulse';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Đang tải bài thi...</p>
        </div>
      </MainLayout>
    );
  }

  if (!session || questions.length === 0) {
    return (
      <MainLayout>
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-lg mx-auto mt-8">
          <p className="text-xl text-slate-900 dark:text-white mb-6">Không tìm thấy bài thi</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors" onClick={() => navigate('/quiz/join')}>
            Quay lại
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
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Header - Span Full */}
        <div className="lg:col-span-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex-1 w-full">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{session.title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-medium text-blue-600 dark:text-blue-400">
                Câu hỏi {currentQuestionIndex + 1} / {questions.length}
              </span>
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full w-48 overflow-hidden">
                <div className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono font-bold text-lg min-w-[120px] justify-center transition-colors ${getTimeColorClass()}`}>
            <HiClock className="w-5 h-5" />
            <span>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Question Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                Câu hỏi {currentQuestionIndex + 1}
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>
          

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers.get(currentQuestionIndex) === index;
                const letter = String.fromCharCode(65 + index);

                return (
                  <button
                    key={index}
                    className={`group relative text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 z-10' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}>
                        {letter}
                      </div>
                      <div className={`flex-1 font-medium text-lg leading-relaxed ${
                        isSelected ? 'text-blue-800 dark:text-blue-200' : 'text-slate-700 dark:text-slate-200'
                      }`}>
                        {option}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50">
              <button
                className="flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <HiArrowLeft className="w-5 h-5" />
                Trước
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  <HiFlag className="w-5 h-5" />
                  Nộp bài
                </button>
              ) : (
                <button
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                  onClick={handleNext}
                >
                  Tiếp
                  <HiArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sticky top-24 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Danh sách câu hỏi</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Đã trả lời <span className="text-blue-600 dark:text-blue-400 font-bold">{answeredCount}</span> / {questions.length}</p>
            
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, index) => {
                const isAnswered = answers.has(index);
                const isCurrent = index === currentQuestionIndex;

                let btnClass = "aspect-square rounded-lg font-bold text-sm flex items-center justify-center transition-all cursor-pointer border ";
                
                if (isCurrent) {
                  btnClass += "border-blue-600 bg-blue-600 text-white shadow-md ring-2 ring-blue-200 dark:ring-blue-900";
                } else if (isAnswered) {
                  btnClass += "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30";
                } else {
                  btnClass += "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600";
                }

                return (
                  <button
                    key={index}
                    className={btnClass}
                    onClick={() => handleQuestionJump(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Đang chọn</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-3 h-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded"></div>
                <span>Đã trả lời</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="w-3 h-3 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700 rounded"></div>
                <span>Chưa trả lời</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        <ConfirmModal
          isOpen={submitModalOpen}
          onCancel={() => setSubmitModalOpen(false)}
          onConfirm={confirmSubmit}
          title="Nộp bài thi"
          message={`Bạn đã trả lời ${answeredCount} / ${questions.length} câu hỏi. Bạn có chắc chắn muốn nộp bài?`}
          confirmText="Nộp bài"
          cancelText="Làm tiếp"
          variant="info"
        />
      </div>
    </MainLayout>
  );
};

export default TakeQuiz;
