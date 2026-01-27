import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { HiCheckCircle, HiXCircle, HiClock, HiTrophy, HiArrowLeft, HiHome } from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';
import './QuizResults.css';

interface ResultData {
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  timeSpent: number;
  showResults: boolean;
}

const QuizResults: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const toast = useToastContext();
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState<ResultData | null>(null);

  useEffect(() => {
    // Check if data was passed from submit
    const stateData = location.state?.resultData;
    if (stateData) {
      setResultData(stateData);
      setLoading(false);
    } else {
      // Fetch from API if no state
      fetchResults();
    }
  }, [sessionId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      // Note: We'd need a getSessionResults endpoint for this
      // For now, redirect to history if no state
      toast.info('Loading your quiz history...');
      navigate('/quiz/history');
    } catch (error: any) {
      console.error('Failed to fetch results:', error);
      toast.error('Failed to load results');
      navigate('/quiz/history');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (score: number): string => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải kết quả...</p>
        </div>
      </MainLayout>
    );
  }

  if (!resultData) {
    return (
      <MainLayout>
        <div className="error-container">
          <p>Không tìm thấy kết quả</p>
          <button className="btn-primary" onClick={() => navigate('/quiz/history')}>
            Xem Lịch sử Quiz
          </button>
        </div>
      </MainLayout>
    );
  }

  const grade = getGrade(resultData.score);
  const gradeColor = getGradeColor(resultData.score);
  const percentage = resultData.score;

  return (
    <MainLayout>
      <div className="quiz-results-container">
        {/* Header */}
        <div className="results-header">
          <button className="btn-back" onClick={() => navigate('/quiz/history')}>
            <HiArrowLeft className="icon" />
            View History
          </button>
        </div>

        {/* Main Result Card */}
        <div className="result-card-main">
          {/* Status Badge */}
          <div className={`status-badge ${resultData.passed ? 'passed' : 'failed'}`}>
            {resultData.passed ? (
              <>
                <HiCheckCircle className="status-icon" />
                <span>Đạt!</span>
              </>
            ) : (
              <>
                <HiXCircle className="status-icon" />
                <span>Không đạt</span>
              </>
            )}
          </div>

          {/* Score Display */}
          <div className="score-display">
            <div className="score-circle" style={{ borderColor: gradeColor }}>
              <div className="score-inner">
                <span className="score-value" style={{ color: gradeColor }}>
                  {Math.round(percentage)}%
                </span>
                <span className="score-grade" style={{ color: gradeColor }}>
                  Điểm chữ: {grade}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon correct">
                <HiCheckCircle />
              </div>
              <div className="stat-content">
                <span className="stat-label">Câu trả lời đúng</span>
                <span className="stat-value">
                  {resultData.correctCount} / {resultData.totalQuestions}
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon incorrect">
                <HiXCircle />
              </div>
              <div className="stat-content">
                <span className="stat-label">Câu trả lời sai</span>
                <span className="stat-value">
                  {resultData.totalQuestions - resultData.correctCount} / {resultData.totalQuestions}
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon time">
                <HiClock />
              </div>
              <div className="stat-content">
                <span className="stat-label">Thời gian làm bài</span>
                <span className="stat-value">{formatTime(resultData.timeSpent)}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon score">
                <HiTrophy />
              </div>
              <div className="stat-content">
                <span className="stat-label">Điểm của bạn</span>
                <span className="stat-value">{Math.round(percentage)}%</span>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="result-message">
            {resultData.passed ? (
              <div className="message-box success">
                <h3>Chúc mừng!</h3>
                <p>Bạn đã vượt qua quiz này. Làm tốt lắm!</p>
              </div>
            ) : (
              <div className="message-box failure">
                <h3>Cố gắng lên!</h3>
                <p>Lần này bạn chưa đạt, nhưng đừng bỏ cuộc. Ôn lại và thử lại nhé!</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="result-actions">
            <button className="btn-primary btn-lg" onClick={() => navigate('/')}>
              <HiHome className="icon" />
              Về Trang chủ
            </button>
            <button className="btn-secondary btn-lg" onClick={() => navigate('/quiz/history')}>
              Xem Lịch sử Quiz
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuizResults;
