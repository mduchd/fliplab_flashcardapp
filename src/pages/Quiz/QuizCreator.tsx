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
    toast.success('Question deleted');
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return false;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1}: Please enter a question`);
        return false;
      }

      const emptyOptions = q.options.filter(opt => !opt.trim());
      if (emptyOptions.length > 0) {
        toast.error(`Question ${i + 1}: All options must be filled`);
        return false;
      }

      if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer > 3) {
        toast.error(`Question ${i + 1}: Please select a correct answer`);
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
        toast.success('Quiz updated successfully!');
      } else {
        const response = await quizService.createQuiz(data);
        toast.success('Quiz created successfully!');
        
        // Show access code if private
        if (!isPublic && response.data.quiz.accessCode) {
          toast.info(`Access Code: ${response.data.quiz.accessCode}`);
        }
      }

      navigate('/quiz');
    } catch (error: any) {
      console.error('Failed to save quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading quiz...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="quiz-creator-container">
        {/* Header */}
        <div className="quiz-creator-header">
          <button className="btn-back" onClick={() => navigate('/quiz')}>
            <HiArrowLeft className="icon" />
            Quay lại Quizzes
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
                  placeholder="Enter quiz title..."
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
                  placeholder="Enter quiz description (optional)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  <span>Đặt quiz này ở chế độ công khai (học sinh có thể tìm thấy mà không cần mã truy cập)</span>
                </label>
              </div>
            </div>

            {/* Questions */}
            <div className="quiz-section">
              <div className="section-header">
                <h2 className="section-title">Câu hỏi ({questions.length})</h2>
                <button className="btn-primary btn-sm" onClick={addQuestion}>
                  <HiPlus className="icon" />
                  Thêm Câu hỏi
                </button>
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
                          title="Delete question"
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
            </div>
          </div>

          {/* Right Panel - Settings */}
          <div className="quiz-creator-sidebar">
            <QuizSettingsPanel
              settings={settings}
              onChange={setSettings}
            />

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="btn-primary btn-block"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="spinner-sm"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>{isEditMode ? 'Cập nhật Quiz' : 'Tạo Quiz'}</>
                )}
              </button>
              <button
                className="btn-secondary btn-block"
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
