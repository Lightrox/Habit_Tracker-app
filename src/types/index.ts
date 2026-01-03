export type DSAType = "new" | "revision";
export type GymType = "dumbbells" | "push-pull" | "shoulders";

export interface DSAData {
  done: boolean;
  type: DSAType;
  count: number;
  time: number; // in minutes
}

export interface MeditationData {
  done: boolean;
  time: number; // in minutes
}

export interface GymData {
  done: boolean;
  type: GymType;
  time: number; // in minutes
}

export interface LearningData {
  notes: string;
  time: number; // in minutes
}

export interface ProjectData {
  done: boolean;
  name: string;
  notes: string;
  time: number; // in minutes
}

export interface DailyLog {
  date: string; // YYYY-MM-DD format
  dsa: DSAData;
  meditation: MeditationData;
  gym: GymData;
  learning: LearningData;
  project: ProjectData;
}

export const DEFAULT_DAILY_LOG: DailyLog = {
  date: new Date().toISOString().split('T')[0],
  dsa: {
    done: false,
    type: "new",
    count: 0,
    time: 0,
  },
  meditation: {
    done: false,
    time: 0,
  },
  gym: {
    done: false,
    type: "dumbbells",
    time: 0,
  },
  learning: {
    notes: "",
    time: 0,
  },
  project: {
    done: false,
    name: "",
    notes: "",
    time: 0,
  },
};

