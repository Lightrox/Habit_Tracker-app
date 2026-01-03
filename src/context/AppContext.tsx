import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DailyLog } from '../types';
import { api } from '../utils/api';

interface AppContextType {
  logs: Record<string, DailyLog>;
  saveLog: (log: DailyLog) => Promise<void>;
  getLog: (date: string, forceRefresh?: boolean) => Promise<DailyLog | null>;
  refreshLogs: () => void;
  refreshTrigger: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshLogs = () => {
    // Trigger a refresh by incrementing the counter
    setRefreshTrigger((prev) => {
      const newValue = prev + 1;
      console.log('Refresh triggered, new value:', newValue);
      return newValue;
    });
  };

  const saveLog = async (log: DailyLog) => {
    try {
      const response = await api.saveLog(log);
      
      if (response.error) {
        console.error('API error:', response.error);
        throw new Error(response.error);
      }
      
      if (response.data) {
        const updatedLog = convertDbLogToDailyLog(response.data.log);
        setLogs((prev) => ({ ...prev, [log.date]: updatedLog }));
        refreshLogs();
      } else {
        throw new Error('No data returned from API');
      }
    } catch (error) {
      console.error('Error in saveLog:', error);
      throw error;
    }
  };

  const getLog = async (date: string, forceRefresh = false): Promise<DailyLog | null> => {
    // If we have it in cache and not forcing refresh, return cached
    if (logs[date] && !forceRefresh) {
      return logs[date];
    }

    // Always fetch from API to ensure fresh data
    const response = await api.getLogByDate(date);
    if (response.data?.log) {
      const dailyLog = convertDbLogToDailyLog(response.data.log);
      setLogs((prev) => ({ ...prev, [date]: dailyLog }));
      return dailyLog;
    }
    return null;
  };

  return (
    <AppContext.Provider value={{ logs, saveLog, getLog, refreshLogs, refreshTrigger }}>
      {children}
    </AppContext.Provider>
  );
};

function convertDbLogToDailyLog(dbLog: any): DailyLog {
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
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

