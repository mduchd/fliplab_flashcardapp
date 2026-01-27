import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizService, Question, QuizSettings } from '../../services/quizService';
import MainLayout from '../../components/layout/MainLayout';
import QuestionEditor from '../../components/Quiz/QuestionEditor';
import QuizSettingsPanel from '../../components/Quiz/QuizSettingsPanel';
import { HiPlus, HiTrash, HiArrowLeft } from 'react-icons/hi2';
import { useToastContext } from '../../contexts/ToastContext';
import './QuizCreator.css';

const QuizCreator: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const toast = useToastContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<QuizSettings>({
    timeLimit: 30,
    passingScore: 60,
    shuffleQuestions: false,
    shuffleOptions: false,
    showResults: true,
    allowRetake: true,
  });
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      loadQuiz(id);
    } else {
      // Add one empty question by default
      addQuestion();
    }
  }, [id, isEditMode]);

  const loadQuiz = async (quizId: string) => {
    try {
      setLoading(true);
      const response = await quizService.getQuizById(quizId);
      const quiz = response.data.quiz;

      setTitle(quiz.title);
      setDescription(quiz.description || '');
      setQuestions(quiz.questions);
      setSettings(quiz.settings);
      setIsPublic(quiz.isPublic);
    } catch (error: any) {
      console.error('Failed to load quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to load quiz');
      navigate('/quiz');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, question: Question) => {
    const updated = [...questions];
    updated[index] = question;
    setQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
    toast.success('Đã xóa câu hỏi');
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề Quiz');
      return false;
    }

    if (questions.length === 0) {
      toast.error('Vui lòng thêm ít nhất một câu hỏi');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      if (!q.question.trim()) {
        toast.error(`Câu hỏi ${i + 1}: Vui lòng nhập nội dung câu hỏi`);
        return false;
      }

      const emptyOptions = q.options.filter(opt => !opt.trim());
      if (emptyOptions.length > 0) {
        toast.error(`Câu hỏi ${i + 1}: Vui lòng nhập đầy đủ các đáp án`);
        return false;
      }

      if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer > 3) {
        toast.error(`Câu hỏi ${i + 1}: Vui lòng chọn đáp án đúng`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const data = {
        title,
        description,
        questions,
        settings,
        isPublic,
      };

      if (isEditMode && id) {
        await quizService.updateQuiz(id, data);
        toast.success('Cập nhật Quiz thành công!');
      } else {
        const response = await quizService.createQuiz(data);
        toast.success('Tạo Quiz mới thành công!');
        
        // Show access code if private
        if (!isPublic && response.data.quiz.accessCode) {
          toast.info(`Mã truy cập: ${response.data.quiz.accessCode}`);
        }
      }

      navigate('/quiz');
    } catch (error: any) {
      console.error('Failed to save quiz:', error);
      toast.error(error.response?.data?.message || 'Lưu quiz thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải quiz...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="quiz-creator-container">
        {/* Header */}
        <div className="quiz-creator-header">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all group cursor-pointer mb-6" 
            onClick={() => navigate('/quiz')}
          >
            <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Quay lại danh sách</span>
          </button>
          <h1 className="page-title">
            {isEditMode ? 'Sửa Quiz' : 'Tạo Quiz Mới'}
          </h1>
        </div>

        <div className="quiz-creator-content">
          {/* Left Panel - Quiz Details & Questions */}
          <div className="quiz-creator-main">
            {/* Basic Info */}
            <div className="quiz-section">
              <h2 className="section-title">Thông tin cơ bản</h2>
              
              <div className="form-group">
                <label htmlFor="title" className="form-label">Tiêu đề Quiz *</label>
                <input
                  id="title"
                  type="text"
                  className="form-input"
                  placeholder="Nhập tiêu đề quiz..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Mô tả</label>
                <textarea
                  id="description"
                  className="form-textarea"
                  placeholder="Nhập mô tả quiz (tùy chọn)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div className="form-group">
                <label className="relative flex items-center justify-between cursor-pointer group p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors bg-white dark:bg-slate-800/50">
                  <div className="flex-1 pr-4">
                    <div className="font-medium text-slate-700 dark:text-slate-200 mb-0.5">Công khai Quiz</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Cho phép học sinh tìm thấy quiz mà không cần mã truy cập</div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </div>
                </label>
              </div>
            </div>

            {/* Questions */}
            <div className="quiz-section">
              <div className="section-header">
                <h2 className="section-title">Câu hỏi ({questions.length})</h2>

              </div>

              <div className="questions-list">
                {questions.map((question, index) => (
                  <div key={index} className="question-item">
                    <div className="question-header">
                      <span className="question-number">Câu hỏi {index + 1}</span>
                      {questions.length > 1 && (
                        <button
                          className="btn-danger btn-icon"
                          onClick={() => deleteQuestion(index)}
                          title="Xóa câu hỏi"
                        >
                          <HiTrash />
                        </button>
                      )}
                    </div>
                    <QuestionEditor
                      question={question}
                      onChange={(updated) => updateQuestion(index, updated)}
                    />
                  </div>
                ))}
              </div>

              <button
                className="w-full mt-4 py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
                onClick={addQuestion}
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center transition-colors">
                  <HiPlus className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <span className="font-medium">Thêm Câu hỏi Mới</span>
              </button>
            </div>
          </div>

          {/* Right Panel - Settings */}
          <div className="quiz-creator-sidebar">
            <QuizSettingsPanel
              settings={settings}
              onChange={setSettings}
            />

            {/* Action Buttons */}
            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>{isEditMode ? 'Cập nhật Quiz' : 'Tạo Quiz'}</span>
                )}
              </button>
              
              <button
                className="w-full py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer disabled:opacity-70"
                onClick={() => navigate('/quiz')}
                disabled={saving}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuizCreator;
