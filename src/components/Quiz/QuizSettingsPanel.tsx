import React from 'react';
import { QuizSettings } from '../../services/quizService';
import { HiClock, HiTrophy, HiArrowPath, HiEye, HiCheckCircle, HiAdjustmentsHorizontal, HiCalendar } from 'react-icons/hi2';

interface QuizSettingsPanelProps {
  settings: QuizSettings;
  onChange: (settings: QuizSettings) => void;
}

const QuizSettingsPanel: React.FC<QuizSettingsPanelProps> = ({ settings, onChange }) => {
  const updateSetting = <K extends keyof QuizSettings>(key: K, value: QuizSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  // Helper to safely extract date/time strings without timezone shifting glitches
  const getISOStringParts = (isoString?: string | null) => {
    if (!isoString) return { date: '', time: '' };
    // We assume the stored string is ISO. To edit in local time, we must parse safely.
    // Creating a Date object and reading .getFullYear() etc works for local time.
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { date: '', time: '' };

    // Format manually to YYYY-MM-DD and HH:mm in LOCAL time to avoid timezone jumps
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    
    return { date: dateStr, time: timeStr };
  };

  const handleScheduleChange = (
    field: 'startDate' | 'endDate', 
    type: 'date' | 'time', 
    value: string
  ) => {
    // 1. Get current values
    const currentISO = settings[field];
    const { date: currentDate, time: currentTime } = getISOStringParts(currentISO);
    
    // 2. Determine new values
    let newDate = type === 'date' ? value : currentDate;
    let newTime = type === 'time' ? value : (currentTime || '00:00');

    // 3. If clearing date, clear the whole setting
    if (type === 'date' && !value) {
      updateSetting(field, null);
      return;
    }

    // 4. Must have a date to form a timestamp
    if (!newDate) return;

    // 5. Construct new Date object from Local string components
    const d = new Date(`${newDate}T${newTime}:00`);
    
    // 6. Save as ISO
    if (!isNaN(d.getTime())) {
      updateSetting(field, d.toISOString());
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-700">
        <HiAdjustmentsHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Cài đặt bài thi
      </h3>

      {/* Time Limit */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
          <HiClock className="w-5 h-5 text-blue-500" />
          <label>Thời gian làm bài</label>
        </div>
        <div className="relative">
          <input
            type="number"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white font-medium pr-12"
            value={settings.timeLimit || ''}
            onChange={(e) => updateSetting('timeLimit', e.target.value === '' ? 0 : parseInt(e.target.value))}
            onBlur={() => {
              if (!settings.timeLimit || settings.timeLimit < 1) updateSetting('timeLimit', 1);
              if (settings.timeLimit > 300) updateSetting('timeLimit', 300);
            }}
            min={1}
            max={300}
            placeholder="30"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400 font-medium pointer-events-none">
            phút
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Tổng thời gian cho phép (tối đa 300 phút)</p>
      </div>

      {/* Schedule */}
      <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
          <HiCalendar className="w-5 h-5 text-blue-500" />
          <label>Lịch thi (Tùy chọn)</label>
        </div>
        
        <div className="flex flex-col gap-3">
          {/* Start Time Config */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Bắt đầu mở đề</div>
            <div className="flex gap-2">
              <input 
                type="date"
                className="flex-[2] px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm dark:[color-scheme:dark] transition-all"
                value={getISOStringParts(settings.startDate).date}
                onChange={(e) => handleScheduleChange('startDate', 'date', e.target.value)}
              />
              <input 
                type="time"
                className="flex-[1] px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm cursor-pointer dark:[color-scheme:dark] transition-all"
                value={getISOStringParts(settings.startDate).time}
                onChange={(e) => handleScheduleChange('startDate', 'time', e.target.value)}
              />
            </div>
          </div>

          {/* End Time Config */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Kết thúc (Đóng đề)</div>
            <div className="flex gap-2">
              <input 
                type="date"
                className="flex-[2] px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm dark:[color-scheme:dark] transition-all"
                value={getISOStringParts(settings.endDate).date}
                onChange={(e) => handleScheduleChange('endDate', 'date', e.target.value)}
                min={getISOStringParts(settings.startDate).date}
              />
              <input 
                type="time"
                className="flex-[1] px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm cursor-pointer dark:[color-scheme:dark] transition-all"
                value={getISOStringParts(settings.endDate).time}
                onChange={(e) => handleScheduleChange('endDate', 'time', e.target.value)}
              />
            </div>
          </div>
          
          
          <p className="text-xs text-slate-500 dark:text-slate-400 italic px-1">
            * Để trống nếu muốn mở đề tự do.
          </p>
        </div>
      </div>

      {/* Passing Score */}
      <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
          <HiTrophy className="w-5 h-5 text-amber-500" />
          <label>Điểm đạt</label>
        </div>
        <div className="relative">
          <input
            type="number"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white font-medium pr-12"
            value={settings.passingScore}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              updateSetting('passingScore', isNaN(val) ? 0 : val);
            }}
            onBlur={() => {
                if (settings.passingScore > 100) updateSetting('passingScore', 100);
                if (settings.passingScore < 0) updateSetting('passingScore', 0);
            }}
            min={0}
            max={100}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400 font-medium pointer-events-none">
            %
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Điểm tối thiểu cần thiết để qua môn</p>
      </div>

      {/* Toggles Group */}
      <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-700/50">
        {/* Shuffle Questions */}
        <label className="relative flex items-start justify-between cursor-pointer group p-2 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition-colors -mx-2">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <HiArrowPath className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Trộn câu hỏi</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-7">Ngẫu nhiên hóa thứ tự câu hỏi</p>
          </div>
          <div className="relative inline-flex items-center mt-1">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.shuffleQuestions}
              onChange={(e) => updateSetting('shuffleQuestions', e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 shadow-inner"></div>
          </div>
        </label>

        {/* Shuffle Options */}
        <label className="relative flex items-start justify-between cursor-pointer group p-2 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition-colors -mx-2">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <HiArrowPath className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Trộn đáp án</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-7">Ngẫu nhiên hóa thứ tự đáp án</p>
          </div>
          <div className="relative inline-flex items-center mt-1">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.shuffleOptions}
              onChange={(e) => updateSetting('shuffleOptions', e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 shadow-inner"></div>
          </div>
        </label>

        {/* Show Results */}
        <label className="relative flex items-start justify-between cursor-pointer group p-2 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition-colors -mx-2">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <HiEye className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Xem kết quả ngay</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-7">Hiện điểm ngay sau khi nộp bài</p>
          </div>
          <div className="relative inline-flex items-center mt-1">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.showResults}
              onChange={(e) => updateSetting('showResults', e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 shadow-inner"></div>
          </div>
        </label>

        {/* Allow Retake */}
        <label className="relative flex items-start justify-between cursor-pointer group p-2 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition-colors -mx-2">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <HiCheckCircle className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Cho phép thi lại</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-7">Học sinh được làm lại nhiều lần</p>
          </div>
          <div className="relative inline-flex items-center mt-1">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.allowRetake}
              onChange={(e) => updateSetting('allowRetake', e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 shadow-inner"></div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default QuizSettingsPanel;
