import { useState, useEffect } from 'react';
import { DailyLog, DEFAULT_DAILY_LOG, DSAType, GymType } from '../types';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';

const TIME_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hr' },
  { value: 90, label: '1.5 hr' },
  { value: 120, label: '2 hr' },
  { value: 150, label: '2.5 hr' },
  { value: 180, label: '3 hr' },
];

const MEDITATION_OPTIONS = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
];

const LEARNING_TIME_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hr' },
  { value: 90, label: '1.5 hr' },
];

const PROJECT_TIME_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hr' },
  { value: 120, label: '2 hr' },
];

const GYM_TIME_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hr' },
];

const DailyTracking: React.FC = () => {
  const { saveLog, getLog, logs } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState<DailyLog>(DEFAULT_DAILY_LOG);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper function to convert DB log to DailyLog format
  const convertDbLogToDailyLog = (dbLog: any): DailyLog => {
    return {
      date: new Date(dbLog.date).toISOString().split('T')[0],
      dsa: {
        done: dbLog.dsa_done || false,
        type: (dbLog.dsa_type?.toLowerCase() || 'new') as 'new' | 'revision',
        count: dbLog.dsa_count || 0,
        time: dbLog.dsa_time || 0,
      },
      meditation: {
        done: dbLog.meditation_done || false,
        time: dbLog.meditation_time || 0,
      },
      gym: {
        done: dbLog.gym_done || false,
        type: (dbLog.gym_type?.toLowerCase().replace('_', '-') || 'dumbbells') as 'dumbbells' | 'push-pull' | 'shoulders',
        time: dbLog.gym_time || 0,
      },
      learning: {
        notes: dbLog.learning_notes || '',
        time: dbLog.learning_time || 0,
      },
      project: {
        done: dbLog.project_done || false,
        name: dbLog.project_name || '',
        notes: dbLog.project_notes || '',
        time: dbLog.project_time || 0,
      },
    };
  };

  // Load data when selectedDate changes - always fetch fresh from API
  useEffect(() => {
    const loadDateData = async () => {
      setLoading(true);
      // Always fetch fresh from API when date changes (force refresh to bypass cache)
      const existing = await getLog(selectedDate, true);
      if (existing) {
        setFormData(existing);
      } else {
        setFormData({ ...DEFAULT_DAILY_LOG, date: selectedDate });
      }
      setLoading(false);
    };
    loadDateData();
  }, [selectedDate, getLog]);

  // Also update when logs change (in case data was saved)
  useEffect(() => {
    if (logs[selectedDate]) {
      setFormData(logs[selectedDate]);
    }
  }, [logs, selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleSave = async () => {
    const hasActivity =
      formData.dsa.done ||
      formData.meditation.done ||
      formData.gym.done ||
      formData.learning.notes.trim() !== '' ||
      formData.project.done;

    if (!hasActivity) {
      alert('Please check at least one activity!');
      return;
    }

    try {
      // Ensure date is set correctly
      const logToSave = { ...formData, date: selectedDate };
      console.log('Saving log:', logToSave);
      await saveLog(logToSave);
      console.log('Log saved successfully');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      
      // Force refresh the current date to get updated data
      const refreshed = await getLog(selectedDate, true);
      if (refreshed) {
        setFormData(refreshed);
      }
    } catch (error) {
      console.error('Error saving log:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const updateDSA = (updates: Partial<DailyLog['dsa']>) => {
    setFormData({
      ...formData,
      dsa: { ...formData.dsa, ...updates },
    });
  };

  const updateMeditation = (updates: Partial<DailyLog['meditation']>) => {
    setFormData({
      ...formData,
      meditation: { ...formData.meditation, ...updates },
    });
  };

  const updateGym = (updates: Partial<DailyLog['gym']>) => {
    setFormData({
      ...formData,
      gym: { ...formData.gym, ...updates },
    });
  };

  const updateLearning = (updates: Partial<DailyLog['learning']>) => {
    setFormData({
      ...formData,
      learning: { ...formData.learning, ...updates },
    });
  };

  const updateProject = (updates: Partial<DailyLog['project']>) => {
    setFormData({
      ...formData,
      project: { ...formData.project, ...updates },
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-white">Daily Tracking</h1>

      {/* Date Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          📅 Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* DSA Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white">🧠 DSA / Skill Development</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.dsa.done}
              onChange={(e) => updateDSA({ done: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-300">DSA Done Today</span>
          </label>

          {formData.dsa.done && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Activity Type
                </label>
                <select
                  value={formData.dsa.type}
                  onChange={(e) => updateDSA({ type: e.target.value as DSAType })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">New Problems</option>
                  <option value="revision">Revision</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Problems Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.dsa.count}
                  onChange={(e) => updateDSA({ count: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time Spent
                </label>
                <select
                  value={formData.dsa.time}
                  onChange={(e) => updateDSA({ time: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Select time</option>
                  {TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Meditation Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white">🧘 Meditation</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.meditation.done}
              onChange={(e) => updateMeditation({ done: e.target.checked, time: e.target.checked ? formData.meditation.time || 5 : 0 })}
              className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-300">Meditation Done</span>
          </label>

          {formData.meditation.done && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration
              </label>
              <select
                value={formData.meditation.time}
                onChange={(e) => updateMeditation({ time: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MEDITATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Gym Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white">🏋️ Gym / Exercise</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.gym.done}
              onChange={(e) => updateGym({ done: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-300">Workout Done</span>
          </label>

          {formData.gym.done && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Workout Type
                </label>
                <select
                  value={formData.gym.type}
                  onChange={(e) => updateGym({ type: e.target.value as GymType })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dumbbells">Dumbbells</option>
                  <option value="push-pull">Push / Pull Ups</option>
                  <option value="shoulders">Shoulders</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Workout Duration
                </label>
                <select
                  value={formData.gym.time}
                  onChange={(e) => updateGym({ time: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Select duration</option>
                  {GYM_TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Learning Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white">📘 Learning</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What I Learned Today
            </label>
            <textarea
              value={formData.learning.notes}
              onChange={(e) => updateLearning({ notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Spring Boot, React hooks, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Learning Time
            </label>
            <select
              value={formData.learning.time}
              onChange={(e) => updateLearning({ time: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Select time</option>
              {LEARNING_TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Project Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white">📂 Project Work</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.project.done}
              onChange={(e) => updateProject({ done: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-300">Worked on Project</span>
          </label>

          {formData.project.done && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.project.name}
                  onChange={(e) => updateProject({ name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What I Implemented Today
                </label>
                <textarea
                  value={formData.project.notes}
                  onChange={(e) => updateProject({ notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what you implemented..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time Spent
                </label>
                <select
                  value={formData.project.time}
                  onChange={(e) => updateProject({ time: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Select time</option>
                  {PROJECT_TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
          saved
            ? 'bg-green-600'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {saved ? '✓ Saved!' : 'Save Day'}
      </button>
    </div>
  );
};

export default DailyTracking;

