import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getCurrentStreak } from '../utils/streaks';

const StreakDisplay: React.FC = () => {
  const { logs } = useApp();
  const [streak, setStreak] = useState(0);

  // Create a stable key from logs to detect changes
  const logsKey = useMemo(() => {
    return JSON.stringify(Object.keys(logs).sort());
  }, [logs]);

  // Recalculate streak whenever logs change
  useEffect(() => {
    setStreak(getCurrentStreak(logs));
  }, [logsKey, logs]);

  return (
    <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-6 mb-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-5xl animate-pulse">🔥</div>
          <div>
            <div className="text-gray-200 text-sm font-medium mb-1">Current Streak</div>
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
        <div className="text-right">
          <div className="text-white text-sm opacity-90">Keep the fire burning!</div>
        </div>
      </div>
    </div>
  );
};

export default StreakDisplay;
