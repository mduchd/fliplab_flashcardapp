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
        <label className="form-label">Question Text *</label>
        <textarea
          className="form-textarea"
          placeholder="Enter your question here..."
          value={question.question}
          onChange={(e) => updateQuestion('question', e.target.value)}
          rows={3}
        />
      </div>

      {/* Options */}
      <div className="form-group">
        <label className="form-label">
          Answer Options * <span className="hint">(Click to select correct answer)</span>
        </label>
        <div className="options-list">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`option-item ${question.correctAnswer === index ? 'correct' : ''}`}
              onClick={() => setCorrectAnswer(index)}
            >
              <div className="option-letter">{String.fromCharCode(65 + index)}</div>
              <input
                type="text"
                className="option-input"
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="option-indicator">
                {question.correctAnswer === index && (
                  <>
                    <HiCheckCircle className="check-icon" />
                    <span className="correct-label">Correct</span>
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
          Time Limit (Optional) 
          <span className="hint"> - Leave empty to use quiz default</span>
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
          <span className="time-unit">seconds</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
