import { DailyLog } from '../types';

export const getCurrentStreak = (logs: Record<string, DailyLog>): number => {
  // Get all log dates and sort them in descending order (most recent first)
  const logDates = Object.keys(logs)
    .filter(date => logs[date].dsa.done)
    .map(date => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime());
  
  if (logDates.length === 0) {
    return 0;
  }
  
  // Start from the most recent log date
  const mostRecentDate = logDates[0];
  mostRecentDate.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(mostRecentDate);
  
  // Count backwards from the most recent log date
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
  // Get all log dates with meditation done and sort them in descending order
  const logDates = Object.keys(logs)
    .filter(date => logs[date].meditation.done)
    .map(date => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime());
  
  if (logDates.length === 0) {
    return 0;
  }
  
  // Start from the most recent log date
  const mostRecentDate = logDates[0];
  mostRecentDate.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(mostRecentDate);
  
  // Count backwards from the most recent log date
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
  // Get all log dates with learning activity and sort them in descending order
  const logDates = Object.keys(logs)
    .filter(date => {
      const log = logs[date];
      return log.learning.notes.trim() !== '' || log.learning.time > 0;
    })
    .map(date => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime());
  
  if (logDates.length === 0) {
    return 0;
  }
  
  // Start from the most recent log date
  const mostRecentDate = logDates[0];
  mostRecentDate.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(mostRecentDate);
  
  // Count backwards from the most recent log date
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
  // Get all log dates with exercise done and sort them in descending order
  const logDates = Object.keys(logs)
    .filter(date => logs[date].gym.done)
    .map(date => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime());
  
  if (logDates.length === 0) {
    return 0;
  }
  
  // Start from the most recent log date
  const mostRecentDate = logDates[0];
  mostRecentDate.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(mostRecentDate);
  
  // Count backwards from the most recent log date
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

