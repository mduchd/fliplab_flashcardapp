import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { HiCheckCircle, HiXCircle, HiClock, HiTrophy, HiArrowLeft, HiHome, HiBookOpen } from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';

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
      toast.info('Đang tải lịch sử quiz...');
      navigate('/quiz/history');
    } catch (error: any) {
      console.error('Failed to fetch results:', error);
      toast.error('Không thể tải kết quả');
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
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Đang tải kết quả...</p>
        </div>
      </MainLayout>
    );
  }

  if (!resultData) {
    return (
      <MainLayout>
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-lg mx-auto mt-8">
          <p className="text-xl text-slate-900 dark:text-white mb-6">Không tìm thấy kết quả</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors" onClick={() => navigate('/quiz/history')}>
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
      <div className="max-w-3xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <button 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors font-medium cursor-pointer" 
            onClick={() => navigate('/quiz/history')}
          >
            <HiArrowLeft className="w-5 h-5" />
            Xem lịch sử
          </button>
        </div>

        {/* Main Result Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 shadow-sm text-center">
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Kết quả bài thi</h1>

          {/* Status Badge */}
          <div 
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-lg mb-10 border-2 ${
              resultData.passed 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
            }`}
          >
            {resultData.passed ? (
              <>
                <HiCheckCircle className="w-6 h-6" />
                <span>ĐẠT</span>
              </>
            ) : (
              <>
                <HiXCircle className="w-6 h-6" />
                <span>KHÔNG ĐẠT</span>
              </>
            )}
          </div>

          {/* Score Display */}
          <div className="mb-12 relative flex justify-center">
            <div 
              className="w-56 h-56 rounded-full border-[16px] flex flex-col items-center justify-center transition-all duration-1000"
              style={{ borderColor: gradeColor }}
            >
                <span className="text-5xl font-black mb-1" style={{ color: gradeColor }}>
                  {Math.round(percentage)}%
                </span>
                <span className="text-xl font-bold uppercase tracking-widest opacity-80" style={{ color: gradeColor }}>
                  Điểm {grade}
                </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <div className="flex justify-center mb-2 text-green-500">
                <HiCheckCircle className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {resultData.correctCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Đúng</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <div className="flex justify-center mb-2 text-red-500">
                <HiXCircle className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {resultData.totalQuestions - resultData.correctCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Sai</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <div className="flex justify-center mb-2 text-blue-500">
                <HiClock className="w-6 h-6" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {formatTime(resultData.timeSpent)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mt-0.5">Thời gian</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <div className="flex justify-center mb-2 text-amber-500">
                <HiTrophy className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {Math.round(percentage)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Điểm</div>
            </div>
          </div>

          {/* Message */}
          <div className={`p-6 rounded-xl mb-10 text-center border ${
             resultData.passed 
               ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30 text-green-700 dark:text-green-300' 
               : 'bg-slate-50 dark:bg-slate-700/30 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            <h3 className="text-lg font-bold mb-1">
              {resultData.passed ? 'Chúc mừng! Bạn đã làm rất tốt!' : 'Đừng nản lòng!'}
            </h3>
            <p className="text-sm opacity-90">
              {resultData.passed 
                ? 'Bạn đã nắm vững kiến thức phần này. Hãy tiếp tục phát huy nhé.' 
                : 'Hãy ôn tập lại kiến thức và thử lại bài thi này sau nhé.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="px-8 py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <HiHome className="w-5 h-5" />
              Về Trang chủ
            </button>
            <button 
              className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer" 
              onClick={() => navigate('/quiz/history')}
            >
              <HiBookOpen className="w-5 h-5" />
              Xem Lịch sử Quiz
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuizResults;
