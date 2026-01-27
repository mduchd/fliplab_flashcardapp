import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService, Quiz } from '../../services/quizService';
import MainLayout from '../../components/layout/MainLayout';
import { HiPlus, HiPencil, HiTrash, HiEye, HiClipboardDocument, HiUsers, HiClipboardDocumentList } from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';
import './QuizList.css';

const QuizList: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizService.getMyQuizzes();
      setQuizzes(response.data.quizzes);
    } catch (error: any) {
      console.error('Failed to fetch quizzes:', error);
      toast.error(error.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedQuiz) return;

    try {
      await quizService.deleteQuiz(selectedQuiz._id);
      toast.success('Quiz deleted successfully');
      setQuizzes(quizzes.filter(q => q._id !== selectedQuiz._id));
      setDeleteModalOpen(false);
      setSelectedQuiz(null);
    } catch (error: any) {
      console.error('Failed to delete quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to delete quiz');
    }
  };

  const handleCopyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Access code copied to clipboard!');
  };

  return (
    <MainLayout>
      <div className="quiz-list-container">
        {/* Header */}
        <div className="quiz-list-header">
          <div>
            <h1 className="page-title">Quiz của tôi</h1>
            <p className="page-subtitle">Tạo và quản lý các quiz của bạn</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate('/quiz/create')}
          >
            <HiPlus className="icon" />
            Tạo Quiz
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải quiz...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && quizzes.length === 0 && (
          <div className="empty-state">
            <HiClipboardDocumentList className="empty-icon" />
            <h3>Chưa có quiz nào</h3>
            <p>Tạo quiz đầu tiên để bắt đầu!</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/quiz/create')}
            >
              <HiPlus className="icon" />
              Tạo Quiz Đầu Tiên
            </button>
          </div>
        )}

        {/* Quiz Grid */}
        {!loading && quizzes.length > 0 && (
          <div className="quiz-grid">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="quiz-card">
                {/* Card Header */}
                <div className="quiz-card-header">
                  <h3 className="quiz-title">{quiz.title}</h3>
                  <div className="quiz-badge">
                    {quiz.isPublic ? 'Công khai' : 'Riêng tư'}
                  </div>
                </div>

                {/* Description */}
                {quiz.description && (
                  <p className="quiz-description">{quiz.description}</p>
                )}

                {/* Quiz Info */}
                <div className="quiz-info">
                  <div className="info-item">
                    <span className="info-label">Câu hỏi:</span>
                    <span className="info-value">{quiz.questions.length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Thời gian:</span>
                    <span className="info-value">{quiz.settings.timeLimit} min</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Điểm đạt:</span>
                    <span className="info-value">{quiz.settings.passingScore}%</span>
                  </div>
                </div>

                {/* Access Code */}
                {quiz.accessCode && (
                  <div className="access-code-section">
                    <span className="access-label">Mã truy cập:</span>
                    <div className="access-code-display">
                      <code className="access-code">{quiz.accessCode}</code>
                      <button
                        className="btn-icon-sm"
                        onClick={() => handleCopyAccessCode(quiz.accessCode!)}
                        title="Copy access code"
                      >
                        <HiClipboardDocument />
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="quiz-actions">
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => navigate(`/quiz/${quiz._id}/results`)}
                    title="View Results"
                  >
                    <HiUsers className="icon" />
                    Kết quả
                  </button>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => navigate(`/quiz/${quiz._id}`)}
                    title="View Quiz"
                  >
                    <HiEye className="icon" />
                    Xem
                  </button>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => navigate(`/quiz/edit/${quiz._id}`)}
                    title="Edit Quiz"
                  >
                    <HiPencil className="icon" />
                    Sửa
                  </button>
                  <button
                    className="btn-danger btn-sm"
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      setDeleteModalOpen(true);
                    }}
                    title="Delete Quiz"
                  >
                    <HiTrash className="icon" />
                    Xóa
                  </button>
                </div>

                {/* Created Date */}
                <div className="quiz-footer">
                  <span className="created-date">
                    Created {new Date(quiz.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModalOpen}
          onCancel={() => {
            setDeleteModalOpen(false);
            setSelectedQuiz(null);
          }}
          onConfirm={handleDelete}
          title="Delete Quiz"
          message={`Are you sure you want to delete "${selectedQuiz?.title}"? This action cannot be undone and will delete all associated quiz sessions.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </MainLayout>
  );
};

export default QuizList;
