import React from 'react';
import { Question } from '../../services/quizService';
import { HiCheckCircle } from 'react-icons/hi2';
import './QuestionEditor.css';

interface QuestionEditorProps {
  question: Question;
  onChange: (question: Question) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onChange }) => {
  const updateQuestion = (field: keyof Question, value: any) => {
    onChange({ ...question, [field]: value });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    onChange({ ...question, options: newOptions });
  };

  const setCorrectAnswer = (index: number) => {
    onChange({ ...question, correctAnswer: index });
  };

  return (
    <div className="question-editor">
      {/* Question Text */}
      <div className="form-group">
        <label className="form-label">Nội dung câu hỏi *</label>
        <textarea
          className="form-textarea"
          placeholder="Nhập câu hỏi của bạn vào đây..."
          value={question.question}
          onChange={(e) => updateQuestion('question', e.target.value)}
          rows={3}
        />
      </div>

      {/* Options */}
      <div className="form-group">
        <label className="form-label">
          Các lựa chọn đáp án * <span className="hint">(Click để chọn đáp án đúng)</span>
        </label>
        <div className="options-list">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`option-item cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 ${question.correctAnswer === index ? 'correct' : ''}`}
              onClick={() => setCorrectAnswer(index)}
            >
              <div className="option-letter">{String.fromCharCode(65 + index)}</div>
              <input
                type="text"
                className="option-input"
                placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="option-indicator">
                {question.correctAnswer === index && (
                  <>
                    <HiCheckCircle className="check-icon" />
                    <span className="correct-label">Đúng</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Time Limit */}
      <div className="form-group">
        <label className="form-label">
          Giới hạn thời gian (Tùy chọn) 
          <span className="hint"> - Để trống để dùng mặc định của bài thi</span>
        </label>
        <div className="time-input-group">
          <input
            type="number"
            className="form-input time-input"
            placeholder="30"
            value={question.timeLimit || ''}
            onChange={(e) => updateQuestion('timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
            min={5}
            max={300}
          />
          <span className="time-unit">giây</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
