import React from 'react';
import { Question } from '../../services/quizService';
import { HiCheckCircle } from 'react-icons/hi2';

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
    <div className="flex flex-col gap-6">
      {/* Question Text */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Nội dung câu hỏi <span className="text-red-500">*</span></label>
        <textarea
          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white min-h-[80px]"
          placeholder="Nhập câu hỏi của bạn vào đây..."
          value={question.question}
          onChange={(e) => updateQuestion('question', e.target.value)}
          rows={3}
        />
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
          Các lựa chọn đáp án <span className="text-red-500">*</span> <span className="text-slate-400 dark:text-slate-500 font-normal text-xs ml-1">(Click để chọn đáp án đúng)</span>
        </label>
        <div className="grid grid-cols-1 gap-3">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                question.correctAnswer === index 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500 dark:ring-green-500 dark:border-green-500' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
              }`}
              onClick={() => setCorrectAnswer(index)}
            >
              <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg font-bold transition-colors ${
                question.correctAnswer === index 
                  ? 'bg-green-500 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {String.fromCharCode(65 + index)}
              </div>
              <input
                type="text"
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none text-base"
                placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="w-6 flex justify-center">
                {question.correctAnswer === index && (
                  <HiCheckCircle className="w-6 h-6 text-green-500 dark:text-green-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Time Limit */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
          Giới hạn thời gian (Tùy chọn) 
          <span className="text-slate-400 dark:text-slate-500 font-normal text-xs ml-1"> - Để trống để dùng mặc định</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 dark:text-white text-center font-medium"
            placeholder="30"
            value={question.timeLimit || ''}
            onChange={(e) => updateQuestion('timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
            min={5}
            max={300}
          />
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">giây</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
