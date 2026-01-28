import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService, QuizSession } from '../../services/quizService';
import MainLayout from '../../components/layout/MainLayout';
import { HiArrowLeft, HiCheckCircle, HiXCircle, HiClock, HiClipboardDocumentList, HiChartBar } from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';

const StudentQuizHistory: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await quizService.getMyQuizSessions();
      setSessions(response.data.sessions);
    } catch (error: any) {
      console.error('Failed to fetch quiz history:', error);
      toast.error(error.response?.data?.message || 'Không thể tải lịch sử quiz');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Đã hoàn thành</span>;
      case 'in-progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Đang làm</span>;
      case 'abandoned':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400">Đã bỏ dở</span>;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // green-500
    if (score >= 60) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 rounded-xl transition-all group cursor-pointer mb-4" 
              onClick={() => navigate('/quiz')}
            >
              <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Quay lại danh sách</span>
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HiClipboardDocumentList className="w-8 h-8 text-blue-600" />
              Lịch sử Quiz của tôi
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Xem lại kết quả của các bài kiểm tra bạn đã thực hiện</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Đang tải lịch sử quiz...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
            <div className="w-20 h-20 bg-blue-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
              <HiClipboardDocumentList className="w-10 h-10 text-blue-200 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Chưa có lịch sử làm bài</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
              Bạn chưa tham gia bài kiểm tra nào. Hãy tham gia một bài quiz để theo dõi tiến độ của bạn!
            </p>
            <button 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all cursor-pointer" 
              onClick={() => navigate('/quiz')}
            >
              Tham gia Quiz ngay
            </button>
          </div>
        )}

        {/* Sessions List */}
        {!loading && sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => {
              const quizTitle = typeof session.quizId === 'string' 
                ? 'Quiz không xác định' 
                : session.quizId?.title || 'Quiz không tên';
              const scoreColor = getScoreColor(session.score);

              return (
                <div key={session._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full ring-1 ring-transparent hover:ring-blue-500/20">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg line-clamp-2 mb-1" title={quizTitle}>{quizTitle}</h3>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <HiClock className="w-3.5 h-3.5" />
                        {formatDate(session.startedAt)}
                      </div>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>

                  {/* Only show details for completed quizzes */}
                  {session.status === 'completed' && (
                    <div className="mt-auto space-y-4">
                      {/* Score Display */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kết quả</span>
                          <div className="flex items-center gap-2">
                             {session.passed ? (
                              <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                                <HiCheckCircle className="w-5 h-5" />
                                Đạt
                              </span>
                            ) : (
                              <span className="text-red-500 dark:text-red-400 font-bold flex items-center gap-1">
                                <HiXCircle className="w-5 h-5" />
                                Không đạt
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-2xl font-bold" style={{ color: scoreColor }}>{Math.round(session.score)}%</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm px-2">
                        <div className="flex flex-col">
                          <span className="text-slate-500 dark:text-slate-400 text-xs">Số câu đúng</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {session.correctCount} / {session.totalQuestions}
                          </span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-slate-500 dark:text-slate-400 text-xs">Thời gian</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{formatTime(session.timeSpent)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* In Progress Message */}
                  {session.status === 'in-progress' && (
                    <div className="mt-auto p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-center text-sm font-medium">
                      Đang trong quá trình làm bài...
                    </div>
                  )}
                  
                  {session.status === 'abandoned' && (
                    <div className="mt-auto p-4 bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 rounded-xl text-center text-sm font-medium">
                      Đã bỏ dở bài thi
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && sessions.length > 0 && (
          <div className="mt-12 bg-blue-50 dark:bg-slate-800 rounded-2xl border border-blue-100 dark:border-slate-700 p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <HiChartBar className="w-6 h-6 text-blue-600" />
              Thống kê tổng quan
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{sessions.length}</span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Tổng số lần thi</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  {sessions.filter(s => s.status === 'completed').length}
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Hoàn thành</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {sessions.filter(s => s.passed).length}
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Số lần đạt (Pass)</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-amber-500 dark:text-amber-400 mb-1">
                  {sessions.filter(s => s.status === 'completed').length > 0
                    ? Math.round(
                        sessions
                          .filter(s => s.status === 'completed')
                          .reduce((sum, s) => sum + s.score, 0) /
                        sessions.filter(s => s.status === 'completed').length
                      )
                    : 0}%
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Điểm trung bình</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default StudentQuizHistory;
