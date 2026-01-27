import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import MainLayout from '../../components/layout/MainLayout';
import { HiArrowLeft, HiArrowRight, HiClipboardDocumentCheck, HiLightBulb, HiBookOpen } from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';
import './JoinQuiz.css';

const JoinQuiz: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessCode.trim()) {
      toast.error('Please enter an access code');
      return;
    }

    try {
      setLoading(true);
      const response = await quizService.joinQuiz(accessCode.trim());
      const quizId = response.data.quiz.id;
      
      toast.success(`Joined: ${response.data.quiz.title}`);
      
      // Navigate to quiz taking page
      navigate(`/quiz/take/${quizId}`);
    } catch (error: any) {
      console.error('Failed to join quiz:', error);
      toast.error(error.response?.data?.message || 'Invalid access code');
    } finally {
      setLoading(false);
    }
  };

  const formatAccessCode = (value: string) => {
    // Auto-format to uppercase and remove spaces
    return value.toUpperCase().replace(/\s/g, '');
  };

  return (
    <MainLayout>
      <div className="join-quiz-container">
        <button className="btn-back" onClick={() => navigate('/')}>
          <HiArrowLeft className="icon" />
          Quay lại
        </button>

        <div className="join-quiz-card">
          {/* Icon/Header */}
          <div className="join-quiz-header">
            <HiClipboardDocumentCheck className="quiz-icon" />
            <h1 className="join-title">Tham gia Quiz</h1>
            <p className="join-subtitle">Nhập mã truy cập được cung cấp bởi giảng viên</p>
          </div>

          {/* Form */}
          <form onSubmit={handleJoin} className="join-form">
            <div className="form-group">
              <label htmlFor="accessCode" className="form-label">
                Mã truy cập
              </label>
              <input
                id="accessCode"
                type="text"
                className="access-code-input"
                placeholder="ABCD1234"
                value={accessCode}
                onChange={(e) => setAccessCode(formatAccessCode(e.target.value))}
                maxLength={20}
                autoFocus
                disabled={loading}
              />
              <p className="form-hint">
                Enter the code exactly as shown (case-insensitive)
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary btn-block btn-lg"
              disabled={loading || !accessCode.trim()}
            >
              {loading ? (
                <>
                  <div className="spinner-sm"></div>
                  Đang tham gia...
                </>
              ) : (
                <>
                  Tham gia Quiz
                  <HiArrowRight className="icon" />
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="info-box">
            <h3 className="info-title"><HiLightBulb className="inline w-4 h-4 mr-1" /> Mẹo:</h3>
            <ul className="info-list">
              <li>Đảm bảo kết nối mạng ổn định</li>
              <li>Tìm nơi yên tĩnh để làm bài</li>
              <li>Đọc kỹ tất cả các câu hỏi trước khi trả lời</li>
              <li>Theo dõi thời gian làm bài</li>
            </ul>
          </div>
        </div>

        {/* Quick Links */}
        <div className="quick-links">
          <button
            className="link-button"
            onClick={() => navigate('/quiz/history')}
          >
            <HiBookOpen className="inline w-4 h-4 mr-1" />
            Xem Lịch sử Quiz
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default JoinQuiz;
