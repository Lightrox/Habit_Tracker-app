import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DailyLog } from '../types';
import { api } from '../utils/api';

interface AppContextType {
  logs: Record<string, DailyLog>;
  saveLog: (log: DailyLog) => Promise<void>;
  getLog: (date: string) => Promise<DailyLog | null>;
  refreshLogs: () => void;
  refreshTrigger: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshLogs = () => {
    // Trigger a refresh by incrementing the counter
    setRefreshTrigger((prev) => prev + 1);
  };

  const saveLog = async (log: DailyLog) => {
    const dbLog = {
      date: log.date,
      dsaDone: log.dsa.done,
      dsaType: log.dsa.type.toUpperCase() as 'NEW' | 'REVISION',
      dsaCount: log.dsa.count,
      dsaTime: log.dsa.time,
      meditationDone: log.meditation.done,
      meditationTime: log.meditation.time,
      gymDone: log.gym.done,
      gymType: log.gym.type.toUpperCase().replace('-', '_') as 'DUMBBELLS' | 'PUSH_PULL' | 'SHOULDERS',
      gymTime: log.gym.time,
      learningNotes: log.learning.notes,
      learningTime: log.learning.time,
      projectDone: log.project.done,
      projectName: log.project.name,
      projectNotes: log.project.notes,
      projectTime: log.project.time,
    };

    const response = await api.saveLog(dbLog);
    if (response.data) {
      const updatedLog = convertDbLogToDailyLog(response.data.log);
      setLogs((prev) => ({ ...prev, [log.date]: updatedLog }));
      // Trigger refresh for other components
      refreshLogs();
    }
  };

  const getLog = async (date: string): Promise<DailyLog | null> => {
    if (logs[date]) {
      return logs[date];
    }

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
      done: dbLog.dsaDone || false,
      type: (dbLog.dsaType?.toLowerCase() || 'new') as 'new' | 'revision',
      count: dbLog.dsaCount || 0,
      time: dbLog.dsaTime || 0,
    },
    meditation: {
      done: dbLog.meditationDone || false,
      time: dbLog.meditationTime || 0,
    },
    gym: {
      done: dbLog.gymDone || false,
      type: (dbLog.gymType?.toLowerCase().replace('_', '-') || 'dumbbells') as 'dumbbells' | 'push-pull' | 'shoulders',
      time: dbLog.gymTime || 0,
    },
    learning: {
      notes: dbLog.learningNotes || '',
      time: dbLog.learningTime || 0,
    },
    project: {
      done: dbLog.projectDone || false,
      name: dbLog.projectName || '',
      notes: dbLog.projectNotes || '',
      time: dbLog.projectTime || 0,
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

