import { useState, useEffect } from 'react';
import { DailyLog, DEFAULT_DAILY_LOG, DSAType, GymType } from '../types';
import { useApp } from '../context/AppContext';

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
  const { saveLog, getLog } = useApp();
  const [formData, setFormData] = useState<DailyLog>(DEFAULT_DAILY_LOG);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadToday = async () => {
      const today = new Date().toISOString().split('T')[0];
      const existing = await getLog(today);
      if (existing) {
        setFormData(existing);
      } else {
        setFormData({ ...DEFAULT_DAILY_LOG, date: today });
      }
    };
    loadToday();
  }, [getLog]);

  const handleDateChange = async (date: string) => {
    const existing = await getLog(date);
    if (existing) {
      setFormData(existing);
    } else {
      setFormData({ ...DEFAULT_DAILY_LOG, date });
    }
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

    await saveLog(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          value={formData.date}
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

