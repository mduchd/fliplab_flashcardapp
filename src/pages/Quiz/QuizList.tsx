import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService, Quiz } from '../../services/quizService';
import MainLayout from '../../components/layout/MainLayout';
import { HiPlus, HiPencil, HiTrash, HiEye, HiClipboardDocument, HiUsers, HiClipboardDocumentList, HiGlobeAlt, HiLockClosed } from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

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

  const handleDelete = () => {
    if (!selectedQuiz) return;
    
    const quizToDelete = selectedQuiz;
    setDeleteModalOpen(false);
    setSelectedQuiz(null);

    // Optimistically remove from UI
    setQuizzes(prev => prev.filter(q => q._id !== quizToDelete._id));

    // Schedule actual delete
    const timeoutId = setTimeout(async () => {
      try {
        await quizService.deleteQuiz(quizToDelete._id);
      } catch (error) {
        console.error('Failed to delete quiz:', error);
        toast.error('Không thể xóa quiz trên hệ thống');
        fetchQuizzes(); // Restore on failure
      }
    }, 5000);

    // Show toast with Undo action
    toast.success('Đã xóa quiz thành công', () => {
      clearTimeout(timeoutId);
      setQuizzes(prev => [...prev, quizToDelete]);
    });
  };

  const handleCopyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Đã sao chép mã truy cập!');
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quiz của tôi</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Tạo và quản lý các bài kiểm tra của bạn</p>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
            onClick={() => navigate('/quiz/create')}
          >
            <HiPlus className="w-5 h-5" />
            <span>Tạo Quiz Mới</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Đang tải quiz...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && quizzes.length === 0 && (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
               <HiClipboardDocumentList className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Chưa có quiz nào</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Tạo quiz đầu tiên để bắt đầu kiểm tra kiến thức!</p>
            <button
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer"
              onClick={() => navigate('/quiz/create')}
            >
              <HiPlus className="w-6 h-6" />
              <span>Tạo Quiz Đầu Tiên</span>
            </button>
          </div>
        )}

        {/* Quiz Grid */}
        {!loading && quizzes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div 
                key={quiz._id} 
                className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full bg-none shadow-none cursor-pointer"
                onClick={() => navigate(`/quiz/edit/${quiz._id}`)}
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4 gap-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {quiz.title}
                  </h3>
                  <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                    quiz.isPublic 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800' 
                      : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                  }`}>
                    {quiz.isPublic ? <HiGlobeAlt className="w-3.5 h-3.5" /> : <HiLockClosed className="w-3.5 h-3.5" />}
                    {quiz.isPublic ? 'Công khai' : 'Riêng tư'}
                  </span>
                </div>

                {/* Description - Fixed height for alignment */}
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 h-10 leading-5">
                  {quiz.description || '\u00A0'}
                </p>

                {/* Quiz Info */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-700/50 mb-4">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-slate-900 dark:text-white">{quiz.questions.length}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Câu hỏi</span>
                  </div>
                  <div className="text-center border-l border-slate-100 dark:border-slate-700/50">
                    <span className="block text-xl font-bold text-slate-900 dark:text-white">{quiz.settings.timeLimit}'</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Phút</span>
                  </div>
                  <div className="text-center border-l border-slate-100 dark:border-slate-700/50">
                    <span className="block text-xl font-bold text-slate-900 dark:text-white">{quiz.settings.passingScore}%</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Đạt</span>
                  </div>
                </div>

                {/* Access Code */}
                {quiz.accessCode && (
                  <div 
                    className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded-lg mb-4 border border-slate-100 dark:border-slate-700/50 cursor-text"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-xs font-semibold text-slate-500 uppercase">Mã truy cập</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold text-blue-600 dark:text-blue-400 tracking-wide select-all">
                        {quiz.accessCode}
                      </code>
                      <button
                        className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); handleCopyAccessCode(quiz.accessCode!); }}
                        title="Sao chép mã"
                      >
                        <HiClipboardDocument className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer: Date & Actions */}
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/30">
                  <span className="text-xs font-medium text-slate-400">
                     {new Date(quiz.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  
                  <div className="flex items-center gap-1">
                     <button
                       className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                       onClick={(e) => {
                         e.stopPropagation();
                         toast.info('Tính năng thống kê đang được phát triển');
                       }}
                       title="Xem thống kê"
                     >
                       <HiUsers className="w-5 h-5" />
                     </button>
                     <button
                       className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                       onClick={(e) => {
                         e.stopPropagation();
                         navigate(`/quiz/take/${quiz._id}`);
                       }}
                       title="Làm bài thi"
                     >
                       <HiEye className="w-5 h-5" />
                     </button>
                     <button
                       className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors cursor-pointer"
                       onClick={(e) => {
                         e.stopPropagation();
                         navigate(`/quiz/edit/${quiz._id}`);
                       }}
                       title="Sửa"
                     >
                       <HiPencil className="w-5 h-5" />
                     </button>
                     <button
                       className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedQuiz(quiz);
                         setDeleteModalOpen(true);
                       }}
                       title="Xóa"
                     >
                       <HiTrash className="w-5 h-5" />
                     </button>
                  </div>
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
