import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getCurrentStreak, getMeditationStreak, getLearningStreak, getExerciseStreak } from '../utils/streaks';

interface StreakCardProps {
  title: string;
  icon: string;
  streak: number;
  gradientFrom: string;
  gradientTo: string;
}

const StreakCard: React.FC<StreakCardProps> = ({ title, icon, streak, gradientFrom, gradientTo }) => {
  return (
    <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-5xl">{icon}</div>
          <div>
            <div className="text-gray-200 text-sm font-medium mb-1">{title}</div>
            <div className="text-4xl font-bold text-white">{streak}</div>
            <div className="text-gray-200 text-xs mt-1">
              {streak === 0 
                ? 'Start your streak today!' 
                : streak === 1 
                ? 'Keep it going!' 
                : `${streak} days in a row!`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Streaks: React.FC = () => {
  const { logs } = useApp();
  const [dsaStreak, setDsaStreak] = useState(0);
  const [meditationStreak, setMeditationStreak] = useState(0);
  const [learningStreak, setLearningStreak] = useState(0);
  const [exerciseStreak, setExerciseStreak] = useState(0);

  // Create a stable key from logs to detect changes
  const logsKey = useMemo(() => {
    return JSON.stringify(Object.keys(logs).sort());
  }, [logs]);

  // Recalculate all streaks whenever logs change
  useEffect(() => {
    setDsaStreak(getCurrentStreak(logs));
    setMeditationStreak(getMeditationStreak(logs));
    setLearningStreak(getLearningStreak(logs));
    setExerciseStreak(getExerciseStreak(logs));
  }, [logsKey, logs]);

  const totalStreak = dsaStreak + meditationStreak + learningStreak + exerciseStreak;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-white">Streaks</h1>

      {/* Total Streak Summary */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 mb-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-5xl">🔥</div>
            <div>
              <div className="text-gray-200 text-sm font-medium mb-1">Total Combined Streaks</div>
              <div className="text-4xl font-bold text-white">{totalStreak}</div>
              <div className="text-gray-200 text-xs mt-1">Sum of all activity streaks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Streak Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StreakCard
          title="DSA Streak"
          icon="🧠"
          streak={dsaStreak}
          gradientFrom="from-blue-600"
          gradientTo="to-blue-800"
        />
        <StreakCard
          title="Meditation Streak"
          icon="🧘"
          streak={meditationStreak}
          gradientFrom="from-green-600"
          gradientTo="to-green-800"
        />
        <StreakCard
          title="Learning Streak"
          icon="📘"
          streak={learningStreak}
          gradientFrom="from-yellow-600"
          gradientTo="to-yellow-800"
        />
        <StreakCard
          title="Exercise Streak"
          icon="🏋️"
          streak={exerciseStreak}
          gradientFrom="from-red-600"
          gradientTo="to-red-800"
        />
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">About Streaks</h2>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>
            • <strong className="text-white">DSA Streak:</strong> Consecutive days with DSA problems solved
          </p>
          <p>
            • <strong className="text-white">Meditation Streak:</strong> Consecutive days with meditation completed
          </p>
          <p>
            • <strong className="text-white">Learning Streak:</strong> Consecutive days with learning notes or time spent
          </p>
          <p>
            • <strong className="text-white">Exercise Streak:</strong> Consecutive days with gym/exercise completed
          </p>
          <p className="mt-4 text-gray-400">
            💡 <strong>Tip:</strong> If you miss a day, your streak resets to 0. Keep the momentum going!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Streaks;
