import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { api } from '../utils/api';
import { DailyLog } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const WeeklyAnalysis: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekLogs, setWeekLogs] = useState<DailyLog[]>([]);
  const [summary, setSummary] = useState({
    totalDsaProblems: 0,
    totalRevisionProblems: 0,
    totalStudyTime: 0,
    gymDays: 0,
    meditationDays: 0,
  });
  const [, setLoading] = useState(true);

  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  useEffect(() => {
    const fetchWeekData = async () => {
      setLoading(true);
      const year = selectedDate.getFullYear();
      const weekNumber = getWeekNumber(selectedDate);
      
      const response = await api.getWeekLogs(year, weekNumber);
      if (response.data) {
        const convertedLogs = response.data.logs.map(convertDbLog);
        setWeekLogs(convertedLogs);
        setSummary({
          totalDsaProblems: response.data.summary.totalProblemsSolved,
          totalRevisionProblems: response.data.summary.totalRevisions,
          totalStudyTime: response.data.summary.totalStudyTime,
          gymDays: response.data.summary.workoutDays,
          meditationDays: response.data.summary.meditationDays,
        });
      }
      setLoading(false);
    };
    fetchWeekData();
  }, [selectedDate]);

  const convertDbLog = (dbLog: any): DailyLog => {
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
  };

  const weekStart = useMemo(() => {
    const date = new Date(selectedDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    const start = new Date(date);
    start.setDate(diff);
    return start;
  }, [selectedDate]);

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    return end;
  }, [weekStart]);

  const metrics = useMemo(() => {
    return {
      totalDSAProblems: summary.totalDsaProblems,
      totalDSARevision: summary.totalRevisionProblems,
      totalStudyHours: (summary.totalStudyTime / 60).toFixed(1),
      workoutDays: summary.gymDays,
      meditationDays: summary.meditationDays,
    };
  }, [summary]);

  const dsaProblemsData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      const log = weekLogs.find((l) => l.date === dateStr);
      return {
        day,
        problems: log && log.dsa.done && log.dsa.type === 'new' ? log.dsa.count : 0,
      };
    });
    return data;
  }, [weekLogs, weekStart]);

  const studyTimeData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      const log = weekLogs.find((l) => l.date === dateStr);
      if (!log) return { day, hours: 0 };
      
      let hours = 0;
      if (log.dsa.done) hours += log.dsa.time / 60;
      if (log.learning.time > 0) hours += log.learning.time / 60;
      if (log.project.done) hours += log.project.time / 60;
      
      return { day, hours: parseFloat(hours.toFixed(1)) };
    });
    return data;
  }, [weekLogs, weekStart]);

  const activityDistribution = useMemo(() => {
    let dsaTime = 0;
    let learningTime = 0;
    let projectTime = 0;
    let exerciseTime = 0;

    weekLogs.forEach((log) => {
      if (log.dsa.done) dsaTime += log.dsa.time;
      if (log.learning.time > 0) learningTime += log.learning.time;
      if (log.project.done) projectTime += log.project.time;
      if (log.gym.done) exerciseTime += log.gym.time;
    });

    return [
      { name: 'DSA', value: dsaTime },
      { name: 'Learning', value: learningTime },
      { name: 'Project', value: projectTime },
      { name: 'Exercise', value: exerciseTime },
    ].filter((item) => item.value > 0);
  }, [weekLogs]);

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Weekly Analysis</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleWeekChange('prev')}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Prev
          </button>
          <div className="text-white font-medium">
            {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
            {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <button
            onClick={() => handleWeekChange('next')}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-1">DSA Problems</div>
          <div className="text-2xl font-bold text-white">{metrics.totalDSAProblems}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-1">DSA Revision</div>
          <div className="text-2xl font-bold text-white">{metrics.totalDSARevision}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-1">Study Hours</div>
          <div className="text-2xl font-bold text-white">{metrics.totalStudyHours}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-1">Workout Days</div>
          <div className="text-2xl font-bold text-white">{metrics.workoutDays}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-1">Meditation Days</div>
          <div className="text-2xl font-bold text-white">{metrics.meditationDays}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* DSA Problems Bar Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">DSA Problems per Day</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dsaProblemsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="problems" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Study Time Line Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Study Time per Day</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={studyTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Distribution Pie Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Activity Distribution</h2>
        {activityDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={activityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {activityDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => `${(value / 60).toFixed(1)} hrs`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-gray-400 py-12">No activity data for this week</div>
        )}
      </div>
    </div>
  );
};

export default WeeklyAnalysis;

