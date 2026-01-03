import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import DailyTracking from './pages/DailyTracking';
import WeeklyAnalysis from './pages/WeeklyAnalysis';
import MonthlyReport from './pages/MonthlyReport';
import Streaks from './pages/Streaks';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<DailyTracking />} />
                      <Route path="/weekly" element={<WeeklyAnalysis />} />
                      <Route path="/monthly" element={<MonthlyReport />} />
                      <Route path="/streaks" element={<Streaks />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

