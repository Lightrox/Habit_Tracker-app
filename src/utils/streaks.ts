import { DailyLog } from '../types';

export const getCurrentStreak = (logs: Record<string, DailyLog>): number => {
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

export const getMeditationStreak = (logs: Record<string, DailyLog>): number => {
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

export const getLearningStreak = (logs: Record<string, DailyLog>): number => {
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

export const getExerciseStreak = (logs: Record<string, DailyLog>): number => {
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

