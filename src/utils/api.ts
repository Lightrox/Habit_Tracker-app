import { supabase } from '../lib/supabase';
import { DailyLog } from '../types';

interface LogSummary {
  totalProblemsSolved: number;
  totalRevisions: number;
  totalStudyTime: number;
  workoutDays: number;
  meditationDays: number;
}

interface MonthData {
  logs: DailyLog[];
  dailyHeatmapData: Array<{ day: number; intensity: number }>;
  weeklyTotals: Array<{ week: string; problems: number }>;
  consistencyPercentage: number;
}

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

const convertDailyLogToDb = (log: DailyLog, userId: string) => {
  const dbLog: any = {
    user_id: userId,
    date: log.date,
    dsa_done: log.dsa.done || false,
    meditation_done: log.meditation.done || false,
    gym_done: log.gym.done || false,
    project_done: log.project.done || false,
  };

  if (log.dsa.done) {
    dbLog.dsa_type = log.dsa.type.toUpperCase();
    dbLog.dsa_count = log.dsa.count || 0;
    dbLog.dsa_time = log.dsa.time || 0;
  }

  if (log.meditation.done) {
    dbLog.meditation_time = log.meditation.time || 0;
  }

  if (log.gym.done) {
    dbLog.gym_type = log.gym.type.toUpperCase().replace('-', '_');
    dbLog.gym_time = log.gym.time || 0;
  }

  if (log.learning.notes && log.learning.notes.trim() !== '') {
    dbLog.learning_notes = log.learning.notes;
  }
  if (log.learning.time > 0) {
    dbLog.learning_time = log.learning.time;
  }

  if (log.project.done) {
    if (log.project.name) {
      dbLog.project_name = log.project.name;
    }
    if (log.project.notes) {
      dbLog.project_notes = log.project.notes;
    }
    dbLog.project_time = log.project.time || 0;
  }

  return dbLog;
};

export const api = {
  async saveLog(log: DailyLog): Promise<{ data?: { log: any }; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'Not authenticated' };
      }

      const dbLog = convertDailyLogToDb(log, user.id);

      const { data: existing } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', log.date)
        .maybeSingle();

      let data, error;
      if (existing) {
        const result = await supabase
          .from('daily_logs')
          .update(dbLog)
          .eq('user_id', user.id)
          .eq('date', log.date)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from('daily_logs')
          .insert({ ...dbLog, user_id: user.id })
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) {
        return { error: error.message };
      }

      return { data: { log: data } };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to save log' };
    }
  },

  async getLogByDate(date: string): Promise<{ data?: { log: any }; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: { log: null } };
        }
        return { error: error.message };
      }

      return { data: { log: data } };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch log' };
    }
  },

  async getWeekLogs(year: number, weekNumber: number): Promise<{ data?: { logs: any[]; summary: LogSummary }; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'Not authenticated' };
      }

      const jan1 = new Date(year, 0, 1);
      const daysOffset = (weekNumber - 1) * 7;
      const weekStart = new Date(jan1);
      weekStart.setDate(jan1.getDate() + daysOffset - jan1.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        return { error: error.message };
      }

      const logs = (data || []).map(convertDbLogToDailyLog);

      let totalProblemsSolved = 0;
      let totalRevisions = 0;
      let totalStudyTime = 0;
      let workoutDays = 0;
      let meditationDays = 0;

      logs.forEach((log) => {
        if (log.dsa.done && log.dsa.type === 'new') {
          totalProblemsSolved += log.dsa.count;
        }
        if (log.dsa.done && log.dsa.type === 'revision') {
          totalRevisions += log.dsa.count;
        }
        if (log.dsa.done) {
          totalStudyTime += log.dsa.time;
        }
        if (log.learning.time > 0) {
          totalStudyTime += log.learning.time;
        }
        if (log.project.done) {
          totalStudyTime += log.project.time;
        }
        if (log.gym.done) {
          workoutDays++;
        }
        if (log.meditation.done) {
          meditationDays++;
        }
      });

      return {
        data: {
          logs,
          summary: {
            totalProblemsSolved,
            totalRevisions,
            totalStudyTime,
            workoutDays,
            meditationDays,
          },
        },
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch week logs' };
    }
  },

  async getMonthLogs(year: number, month: number): Promise<{ data?: MonthData; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'Not authenticated' };
      }

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        return { error: error.message };
      }

      const logs = (data || []).map(convertDbLogToDailyLog);
      const daysInMonth = new Date(year, month, 0).getDate();
      const dailyHeatmapData: Array<{ day: number; intensity: number }> = [];
      const weeklyTotals: Array<{ week: string; problems: number }> = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const log = logs.find((l) => l.date === dateStr);

        let intensity = 0;
        if (log) {
          if (log.dsa.done) intensity++;
          if (log.meditation.done) intensity++;
          if (log.gym.done) intensity++;
          if (log.learning.time > 0 || (log.learning.notes && log.learning.notes.trim() !== '')) intensity++;
          if (log.project.done) intensity++;
        }

        dailyHeatmapData.push({ day, intensity });
      }

      const firstDay = new Date(year, month - 1, 1);
      let currentWeekStart = new Date(firstDay);
      const dayOfWeek = currentWeekStart.getDay();
      currentWeekStart.setDate(currentWeekStart.getDate() - dayOfWeek);

      while (currentWeekStart <= endDate) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(currentWeekStart.getDate() + 6);

        const weekLogs = logs.filter((log) => {
          const logDate = new Date(log.date);
          return logDate >= currentWeekStart && logDate <= weekEnd;
        });

        let problems = 0;
        weekLogs.forEach((log) => {
          if (log.dsa.done && log.dsa.type === 'new') {
            problems += log.dsa.count;
          }
        });

        const weekLabel = `${currentWeekStart.getDate()}/${currentWeekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;
        weeklyTotals.push({ week: weekLabel, problems });

        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }

      const activeDays = logs.filter((log) => {
        return (
          log.dsa.done ||
          log.meditation.done ||
          log.gym.done ||
          log.learning.time > 0 ||
          (log.learning.notes && log.learning.notes.trim() !== '') ||
          log.project.done
        );
      }).length;

      const consistencyPercentage = daysInMonth > 0 ? Math.round((activeDays / daysInMonth) * 100) : 0;

      return {
        data: {
          logs,
          dailyHeatmapData,
          weeklyTotals,
          consistencyPercentage,
        },
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch month logs' };
    }
  },
};
