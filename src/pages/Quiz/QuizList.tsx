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
      toast.error(error.response?.data?.message || 'Không thể tải danh sách quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedQuiz) return;

    try {
      await quizService.deleteQuiz(selectedQuiz._id);
      toast.success('Đã xóa quiz thành công');
      setQuizzes(quizzes.filter(q => q._id !== selectedQuiz._id));
      setDeleteModalOpen(false);
      setSelectedQuiz(null);
    } catch (error: any) {
      console.error('Failed to delete quiz:', error);
      toast.error(error.response?.data?.message || 'Xóa quiz thất bại');
    }
  };

  const handleCopyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Đã sao chép mã truy cập!');
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
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg hover:scale-105 transition-all duration-300 transform cursor-pointer"
            onClick={() => navigate('/quiz/create')}
          >
            <HiPlus className="w-5 h-5" />
            <span>Tạo Quiz Mới</span>
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
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg hover:scale-105 transition-all duration-300 transform mt-4 mx-auto cursor-pointer"
              onClick={() => navigate('/quiz/create')}
            >
              <HiPlus className="w-6 h-6" />
              <span>Tạo Quiz Đầu Tiên</span>
            </button>
          </div>
        )}

        {/* Quiz Grid */}
        {!loading && quizzes.length > 0 && (
          <div className="quiz-grid">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="quiz-card cursor-pointer transition-all hover:shadow-md border border-slate-200 dark:border-slate-700">
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
                    <span className="info-value">{quiz.settings.timeLimit} phút</span>
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
                        className="btn-icon-sm cursor-pointer"
                        onClick={() => handleCopyAccessCode(quiz.accessCode!)}
                        title="Sao chép mã"
                      >
                        <HiClipboardDocument />
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="quiz-actions">
                  <button
                    className="btn-secondary btn-sm cursor-pointer"
                    onClick={() => navigate(`/quiz/${quiz._id}/results`)}
                    title="Xem kết quả"
                  >
                    <HiUsers className="icon" />
                    Kết quả
                  </button>
                  <button
                    className="btn-secondary btn-sm cursor-pointer"
                    onClick={() => navigate(`/quiz/${quiz._id}`)}
                    title="Xem chi tiết"
                  >
                    <HiEye className="icon" />
                    Xem
                  </button>
                  <button
                    className="btn-secondary btn-sm cursor-pointer"
                    onClick={() => navigate(`/quiz/edit/${quiz._id}`)}
                    title="Sửa"
                  >
                    <HiPencil className="icon" />
                    Sửa
                  </button>
                  <button
                    className="btn-danger btn-sm cursor-pointer"
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      setDeleteModalOpen(true);
                    }}
                    title="Xóa"
                  >
                    <HiTrash className="icon" />
                    Xóa
                  </button>
                </div>

                {/* Created Date */}
                <div className="quiz-footer">
                  <span className="created-date">
                    Đã tạo {new Date(quiz.createdAt).toLocaleDateString('vi-VN')}
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
          title="Xóa Quiz"
          message={`Bạn có chắc chắn muốn xóa "${selectedQuiz?.title}"? Hành động này không thể hoàn tác và sẽ xóa tất cả lịch sử làm bài liên quan.`}
          confirmText="Xóa"
          cancelText="Hủy"
          variant="danger"
        />
      </div>
    </MainLayout>
  );
};

export default QuizList;
