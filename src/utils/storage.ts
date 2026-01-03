import { DailyLog } from '../types';

const STORAGE_KEY = 'habit_tracker_logs';

export const saveDailyLog = (log: DailyLog): void => {
  const logs = getAllLogs();
  logs[log.date] = log;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

export const getDailyLog = (date: string): DailyLog | null => {
  const logs = getAllLogs();
  return logs[date] || null;
};

export const getAllLogs = (): Record<string, DailyLog> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
};

export const getLogsInRange = (startDate: string, endDate: string): DailyLog[] => {
  const logs = getAllLogs();
  const result: DailyLog[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    if (logs[dateStr]) {
      result.push(logs[dateStr]);
    }
  }
  
  return result;
};

export const getWeekLogs = (date: Date): DailyLog[] => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day;
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return getLogsInRange(
    startOfWeek.toISOString().split('T')[0],
    endOfWeek.toISOString().split('T')[0]
  );
};

export const getMonthLogs = (year: number, month: number): DailyLog[] => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  return getLogsInRange(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );
};

/**
 * Calculates the current DSA streak of consecutive days with DSA done
 * @returns The number of consecutive days with DSA done (returns 0 if today's DSA is not done)
 */
export const getCurrentStreak = (): number => {
  const logs = getAllLogs();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Check today first - if DSA is not done today, streak is 0
  const todayStr = currentDate.toISOString().split('T')[0];
  const todayLog = logs[todayStr];
  
  // If today's DSA is not done, return 0 immediately
  if (!todayLog || !todayLog.dsa.done) {
    return 0;
  }
  
  // Today's DSA is done, count it and continue backwards
  streak++;
  currentDate.setDate(currentDate.getDate() - 1);
  
  // Count backwards through consecutive days
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const log = logs[dateStr];
    
    if (log && log.dsa.done) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // DSA not done on this day, streak is broken
      break;
    }
  }
  
  return streak;
};

/**
 * Calculates the current Meditation streak of consecutive days with Meditation done
 * @returns The number of consecutive days with Meditation done (returns 0 if today's Meditation is not done)
 */
export const getMeditationStreak = (): number => {
  const logs = getAllLogs();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  const todayStr = currentDate.toISOString().split('T')[0];
  const todayLog = logs[todayStr];
  
  if (!todayLog || !todayLog.meditation.done) {
    return 0;
  }
  
  streak++;
  currentDate.setDate(currentDate.getDate() - 1);
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const log = logs[dateStr];
    
    if (log && log.meditation.done) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

/**
 * Calculates the current Learning streak of consecutive days with Learning activity
 * @returns The number of consecutive days with Learning activity (returns 0 if today's Learning is not done)
 */
export const getLearningStreak = (): number => {
  const logs = getAllLogs();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  const todayStr = currentDate.toISOString().split('T')[0];
  const todayLog = logs[todayStr];
  
  // Learning is considered done if there are notes or time spent
  if (!todayLog || (todayLog.learning.notes.trim() === '' && todayLog.learning.time === 0)) {
    return 0;
  }
  
  streak++;
  currentDate.setDate(currentDate.getDate() - 1);
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const log = logs[dateStr];
    
    if (log && (log.learning.notes.trim() !== '' || log.learning.time > 0)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

/**
 * Calculates the current Exercise (Gym) streak of consecutive days with Exercise done
 * @returns The number of consecutive days with Exercise done (returns 0 if today's Exercise is not done)
 */
export const getExerciseStreak = (): number => {
  const logs = getAllLogs();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  const todayStr = currentDate.toISOString().split('T')[0];
  const todayLog = logs[todayStr];
  
  if (!todayLog || !todayLog.gym.done) {
    return 0;
  }
  
  streak++;
  currentDate.setDate(currentDate.getDate() - 1);
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const log = logs[dateStr];
    
    if (log && log.gym.done) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

