import { Navigate, Route, Routes } from 'react-router';
import './App.css';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import EventsPage from './pages/events/EventsPage';
import ClientsPage from './pages/clients/ClientsPage';
import GuestsPage from './pages/guests/GuestsPage';
import SettingsPage from './pages/settings/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/dashboard' element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path='/events' element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
      <Route path='/clients' element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
      <Route path='/guests' element={<ProtectedRoute><GuestsPage /></ProtectedRoute>} />
      <Route path='/settings' element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path='/' element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
