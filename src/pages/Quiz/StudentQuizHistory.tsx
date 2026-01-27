import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService, QuizSession } from '../../services/quizService';
import MainLayout from '../../components/layout/MainLayout';
import { HiArrowLeft, HiCheckCircle, HiXCircle, HiClock, HiClipboardDocumentList, HiChartBar } from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';
import './StudentQuizHistory.css';

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
    return date.toLocaleDateString('en-US', {
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
        return <span className="status-badge completed">Đã hoàn thành</span>;
      case 'in-progress':
        return <span className="status-badge in-progress">Đang làm</span>;
      case 'abandoned':
        return <span className="status-badge abandoned">Đã bỏ dở</span>;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <MainLayout>
      <div className="quiz-history-container">
        {/* Header */}
        <div className="history-header">
          <div>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all group cursor-pointer mb-6" 
              onClick={() => navigate('/quiz/join')}
            >
              <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Quay lại</span>
            </button>
            <h1 className="page-title">Lịch sử Quiz của tôi</h1>
            <p className="page-subtitle">Xem tất cả các lần làm quiz và điểm số</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải lịch sử quiz...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && sessions.length === 0 && (
          <div className="empty-state">
            <HiClipboardDocumentList className="empty-icon" />
            <h3>Chưa có lần làm quiz nào</h3>
            <p>Bắt đầu làm quiz để xem lịch sử!</p>
            <button className="btn-primary" onClick={() => navigate('/quiz/join')}>
              Tham gia Quiz
            </button>
          </div>
        )}

        {/* Sessions List */}
        {!loading && sessions.length > 0 && (
          <div className="sessions-list">
            {sessions.map((session) => {
              const quizTitle = typeof session.quizId === 'string' 
                ? 'Quiz' 
                : session.quizId.title;
              const scoreColor = getScoreColor(session.score);

              return (
                <div key={session._id} className="session-card">
                  {/* Card Header */}
                  <div className="session-header">
                    <div>
                      <h3 className="session-title">{quizTitle}</h3>
                      <p className="session-date">
                        <HiClock className="icon-sm" />
                        {formatDate(session.startedAt)}
                      </p>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>

                  {/* Only show details for completed quizzes */}
                  {session.status === 'completed' && (
                    <>
                      {/* Score Display */}
                      <div className="session-score">
                        <div 
                          className="score-circle-sm"
                          style={{ borderColor: scoreColor }}
                        >
                          <span 
                            className="score-text"
                            style={{ color: scoreColor }}
                          >
                            {Math.round(session.score)}%
                          </span>
                        </div>
                        <div className="score-info">
                          <div className="score-detail">
                            {session.passed ? (
                              <div className="pass-badge">
                                <HiCheckCircle />
                                <span>Đạt</span>
                              </div>
                            ) : (
                              <div className="fail-badge">
                                <HiXCircle />
                                <span>Không đạt</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="session-stats">
                        <div className="stat-item">
                          <span className="stat-label">Số câu đúng:</span>
                          <span className="stat-value correct">
                            {session.correctCount} / {session.totalQuestions}
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Thời gian:</span>
                          <span className="stat-value">{formatTime(session.timeSpent)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Điểm số:</span>
                          <span className="stat-value" style={{ color: scoreColor }}>
                            {Math.round(session.score)}%
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* In Progress Message */}
                  {session.status === 'in-progress' && (
                    <div className="in-progress-message">
                      <p>Không có dữ liệu chi tiết</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && sessions.length > 0 && (
          <div className="summary-card">
            <h3 className="summary-title"><HiChartBar className="inline w-5 h-5 mr-2" />Thống kê tổng quan</h3>
            <div className="summary-grid">
              <div className="summary-stat">
                <span className="summary-value">{sessions.length}</span>
                <span className="summary-label">Tổng số lần</span>
              </div>
              <div className="summary-stat">
                <span className="summary-value">
                  {sessions.filter(s => s.status === 'completed').length}
                </span>
                <span className="summary-label">Hoàn thành</span>
              </div>
              <div className="summary-stat">
                <span className="summary-value">
                  {sessions.filter(s => s.passed).length}
                </span>
                <span className="summary-label">Đã đạt</span>
              </div>
              <div className="summary-stat">
                <span className="summary-value">
                  {sessions.filter(s => s.status === 'completed').length > 0
                    ? Math.round(
                        sessions
                          .filter(s => s.status === 'completed')
                          .reduce((sum, s) => sum + s.score, 0) /
                        sessions.filter(s => s.status === 'completed').length
                      )
                    : 0}%
                </span>
                <span className="summary-label">Điểm trung bình</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default StudentQuizHistory;
