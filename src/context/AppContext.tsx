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
      // Build the log object, only including defined values
      const dbLog: any = {
        date: log.date,
        dsaDone: log.dsa.done || false,
        meditationDone: log.meditation.done || false,
        gymDone: log.gym.done || false,
        projectDone: log.project.done || false,
      };

      // Add DSA fields only if DSA is done
      if (log.dsa.done) {
        dbLog.dsaType = log.dsa.type.toUpperCase() as 'NEW' | 'REVISION';
        dbLog.dsaCount = log.dsa.count || 0;
        dbLog.dsaTime = log.dsa.time || 0;
      }

      // Add meditation time only if meditation is done
      if (log.meditation.done) {
        dbLog.meditationTime = log.meditation.time || 0;
      }

      // Add gym fields only if gym is done
      if (log.gym.done) {
        dbLog.gymType = log.gym.type.toUpperCase().replace('-', '_') as 'DUMBBELLS' | 'PUSH_PULL' | 'SHOULDERS';
        dbLog.gymTime = log.gym.time || 0;
      }

      // Add learning fields if there's content
      if (log.learning.notes && log.learning.notes.trim() !== '') {
        dbLog.learningNotes = log.learning.notes;
      }
      if (log.learning.time > 0) {
        dbLog.learningTime = log.learning.time;
      }

      // Add project fields only if project is done
      if (log.project.done) {
        if (log.project.name) {
          dbLog.projectName = log.project.name;
        }
        if (log.project.notes) {
          dbLog.projectNotes = log.project.notes;
        }
        dbLog.projectTime = log.project.time || 0;
      }

      console.log('Sending to API:', dbLog);
      const response = await api.saveLog(dbLog);
      
      if (response.error) {
        console.error('API error:', response.error);
        throw new Error(response.error);
      }
      
      if (response.data) {
        console.log('API response:', response.data);
        const updatedLog = convertDbLogToDailyLog(response.data.log);
        setLogs((prev) => ({ ...prev, [log.date]: updatedLog }));
        // Trigger refresh for other components
        refreshLogs();
        return updatedLog;
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

