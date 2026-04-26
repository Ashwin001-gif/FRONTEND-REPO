import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ContactSupport from './pages/ContactSupport';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import PublicShare from './pages/PublicShare';
import HomeButton from './components/HomeButton';
import './App.css';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SocketProvider>
          <BrowserRouter>
          {/* Background decorators - shown on all pages */}
          <div className="bg-grid"></div>
          <div className="bg-glow bg-glow-1"></div>
          <div className="bg-glow bg-glow-2"></div>

          <HomeButton />

          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/contact" element={<ContactSupport />} />
            <Route path="/share/:id" element={<PublicShare />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

        </BrowserRouter>
        </SocketProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
