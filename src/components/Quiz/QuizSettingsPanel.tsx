import React from 'react';
import { QuizSettings } from '../../services/quizService';
import { HiClock, HiTrophy, HiArrowPath, HiEye, HiCheckCircle } from 'react-icons/hi2';
import './QuizSettingsPanel.css';

interface QuizSettingsPanelProps {
  settings: QuizSettings;
  onChange: (settings: QuizSettings) => void;
}

const QuizSettingsPanel: React.FC<QuizSettingsPanelProps> = ({ settings, onChange }) => {
  const updateSetting = <K extends keyof QuizSettings>(key: K, value: QuizSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="quiz-settings-panel">
      <h3 className="settings-title">⚙️ Quiz Settings</h3>

      {/* Time Limit */}
      <div className="setting-item">
        <div className="setting-header">
          <HiClock className="setting-icon" />
          <label className="setting-label">Time Limit</label>
        </div>
        <div className="setting-control">
          <input
            type="number"
            className="setting-input"
            value={settings.timeLimit}
            onChange={(e) => updateSetting('timeLimit', parseInt(e.target.value) || 1)}
            min={1}
            max={180}
          />
          <span className="setting-unit">minutes</span>
        </div>
        <p className="setting-description">Total time allowed to complete the quiz</p>
      </div>

      {/* Passing Score */}
      <div className="setting-item">
        <div className="setting-header">
          <HiTrophy className="setting-icon" />
          <label className="setting-label">Passing Score</label>
        </div>
        <div className="setting-control">
          <input
            type="number"
            className="setting-input"
            value={settings.passingScore}
            onChange={(e) => updateSetting('passingScore', parseInt(e.target.value) || 0)}
            min={0}
            max={100}
          />
          <span className="setting-unit">%</span>
        </div>
        <p className="setting-description">Minimum score required to pass</p>
      </div>

      {/* Shuffle Questions */}
      <div className="setting-item">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.shuffleQuestions}
            onChange={(e) => updateSetting('shuffleQuestions', e.target.checked)}
          />
          <div className="checkbox-content">
            <div className="checkbox-header">
              <HiArrowPath className="setting-icon" />
              <span className="checkbox-label">Shuffle Questions</span>
            </div>
            <p className="checkbox-description">Randomize question order for each student</p>
          </div>
        </label>
      </div>

      {/* Shuffle Options */}
      <div className="setting-item">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.shuffleOptions}
            onChange={(e) => updateSetting('shuffleOptions', e.target.checked)}
          />
          <div className="checkbox-content">
            <div className="checkbox-header">
              <HiArrowPath className="setting-icon" />
              <span className="checkbox-label">Shuffle Answer Options</span>
            </div>
            <p className="checkbox-description">Randomize option order within questions</p>
          </div>
        </label>
      </div>

      {/* Show Results */}
      <div className="setting-item">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.showResults}
            onChange={(e) => updateSetting('showResults', e.target.checked)}
          />
          <div className="checkbox-content">
            <div className="checkbox-header">
              <HiEye className="setting-icon" />
              <span className="checkbox-label">Show Results Immediately</span>
            </div>
            <p className="checkbox-description">Display score and answers after submission</p>
          </div>
        </label>
      </div>

      {/* Allow Retake */}
      <div className="setting-item">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.allowRetake}
            onChange={(e) => updateSetting('allowRetake', e.target.checked)}
          />
          <div className="checkbox-content">
            <div className="checkbox-header">
              <HiCheckCircle className="setting-icon" />
              <span className="checkbox-label">Allow Retakes</span>
            </div>
            <p className="checkbox-description">Students can retake this quiz multiple times</p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default QuizSettingsPanel;
