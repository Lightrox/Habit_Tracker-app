import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { api } from '../utils/api';
import { DailyLog } from '../types';
import { useApp } from '../context/AppContext';

const MonthlyReport: React.FC = () => {
  const { refreshTrigger } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthLogs, setMonthLogs] = useState<DailyLog[]>([]);
  const [heatmapData, setHeatmapData] = useState<Array<{ day: number; intensity: number }>>([]);
  const [weeklyDsaData, setWeeklyDsaData] = useState<Array<{ week: string; problems: number }>>([]);
  const [consistencyTrend, setConsistencyTrend] = useState<Array<{ day: number; activities: number }>>([]);
  const [loading, setLoading] = useState(true);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;

  useEffect(() => {
    const fetchMonthData = async () => {
      setLoading(true);
      const response = await api.getMonthLogs(year, month);
      if (response.data) {
        const convertedLogs = response.data.logs.map(convertDbLog);
        setMonthLogs(convertedLogs);
        setHeatmapData(response.data.dailyHeatmapData);
        setWeeklyDsaData(response.data.weeklyTotals);
        
        // Create consistency trend from heatmap data
        const trend = response.data.dailyHeatmapData.map(item => ({
          day: item.day,
          activities: item.intensity,
        }));
        setConsistencyTrend(trend);
      }
      setLoading(false);
    };
    fetchMonthData();
  }, [year, month, refreshTrigger]);

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

  const summary = useMemo(() => {
    let totalProblems = 0;
    let totalStudyHours = 0;
    let workoutSessions = 0;
    let meditationSessions = 0;

    monthLogs.forEach((log) => {
      if (log.dsa.done && log.dsa.type === 'new') {
        totalProblems += log.dsa.count;
      }
      if (log.dsa.done) totalStudyHours += log.dsa.time / 60;
      if (log.learning.time > 0) totalStudyHours += log.learning.time / 60;
      if (log.project.done) totalStudyHours += log.project.time / 60;
      if (log.gym.done) workoutSessions++;
      if (log.meditation.done) meditationSessions++;
    });

    return {
      totalProblems,
      totalStudyHours: totalStudyHours.toFixed(1),
      workoutSessions,
      meditationSessions,
    };
  }, [monthLogs]);


  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-white text-center py-12">Loading...</div>
      </div>
    );
  }

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-800';
    if (intensity === 1) return 'bg-blue-600';
    if (intensity === 2) return 'bg-blue-500';
    if (intensity === 3) return 'bg-green-500';
    if (intensity >= 4) return 'bg-green-400';
    return 'bg-gray-800';
  };

  const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Monthly Report</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleMonthChange('prev')}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Prev
          </button>
          <div className="text-white font-medium text-lg">{monthName}</div>
          <button
            onClick={() => handleMonthChange('next')}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-1">Problems Solved</div>
          <div className="text-3xl font-bold text-white">{summary.totalProblems}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-1">Study Hours</div>
          <div className="text-3xl font-bold text-white">{summary.totalStudyHours}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-1">Workout Sessions</div>
          <div className="text-3xl font-bold text-white">{summary.workoutSessions}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-1">Meditation Sessions</div>
          <div className="text-3xl font-bold text-white">{summary.meditationSessions}</div>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Activity Heatmap</h2>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm text-gray-400 font-medium">
              {day}
            </div>
          ))}
          {(() => {
            const firstDay = new Date(year, month - 1, 1);
            const startOffset = firstDay.getDay();
            const cells = [];
            
            // Empty cells for days before month starts
            for (let i = 0; i < startOffset; i++) {
              cells.push(<div key={`empty-${i}`} className="aspect-square"></div>);
            }
            
            // Days of the month
            heatmapData.forEach((item) => {
              cells.push(
                <div
                  key={item.day}
                  className={`aspect-square rounded ${getIntensityColor(item.intensity)} flex items-center justify-center text-xs text-white font-medium`}
                  title={`${item.day}: ${item.intensity} activities`}
                >
                  {item.day}
                </div>
              );
            });
            
            return cells;
          })()}
        </div>
        <div className="flex items-center justify-end mt-4 space-x-4 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-800 rounded"></div>
            <span>None</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly DSA Totals */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Weekly DSA Totals</h2>
          {weeklyDsaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyDsaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="problems" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-400 py-12">No data for this month</div>
          )}
        </div>

        {/* Consistency Trend */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Consistency Trend</h2>
          {consistencyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={consistencyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="activities" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-400 py-12">No data for this month</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;

