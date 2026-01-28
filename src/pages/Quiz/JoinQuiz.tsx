import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import MainLayout from '../../components/layout/MainLayout';
import { HiArrowLeft, HiArrowRight, HiClipboardDocumentCheck, HiLightBulb, HiBookOpen } from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';

const JoinQuiz: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessCode.trim()) {
      toast.error('Vui lòng nhập mã truy cập');
      return;
    }

    try {
      setLoading(true);
      const response = await quizService.joinQuiz(accessCode.trim());
      const quizId = response.data.quiz.id;
      
      toast.success(`Đã tham gia: ${response.data.quiz.title}`);
      
      // Navigate to quiz taking page
      navigate(`/quiz/take/${quizId}`);
    } catch (error: any) {
      console.error('Failed to join quiz:', error);
      toast.error(error.response?.data?.message || 'Mã truy cập không hợp lệ');
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
      <div className="max-w-lg mx-auto py-12 px-4">
        <button 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors font-medium" 
          onClick={() => navigate('/')}
        >
          <HiArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
          {/* Icon/Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
               <HiClipboardDocumentCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Tham gia Quiz</h1>
            <p className="text-slate-500 dark:text-slate-400">Nhập mã truy cập được cung cấp bởi giảng viên</p>
          </div>

          {/* Form */}
          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="accessCode" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Mã truy cập
              </label>
              <input
                id="accessCode"
                type="text"
                className="w-full px-4 py-4 text-center text-3xl font-mono font-bold tracking-widest uppercase bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
                placeholder="DETAILS"
                value={accessCode}
                onChange={(e) => setAccessCode(formatAccessCode(e.target.value))}
                maxLength={20}
                autoFocus
                disabled={loading}
              />
              <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                Nhập chính xác mã được cung cấp (không phân biệt chữ hoa thường)
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={loading || !accessCode.trim()}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang tham gia...
                </>
              ) : (
                <>
                  Tham gia Quiz
                  <HiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white mb-3">
              <HiLightBulb className="w-4 h-4 text-yellow-500" /> 
              Mẹo:
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside marker:text-slate-400">
              <li>Đảm bảo kết nối mạng ổn định</li>
              <li>Tìm nơi yên tĩnh để làm bài</li>
              <li>Đọc kỹ tất cả các câu hỏi trước khi trả lời</li>
              <li>Theo dõi thời gian làm bài</li>
            </ul>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <button
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer"
            onClick={() => navigate('/quiz/history')}
          >
            <HiBookOpen className="w-5 h-5" />
            Xem Lịch sử Quiz
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default JoinQuiz;
