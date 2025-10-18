import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { StoriesProvider } from './contexts/StoriesContext';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { AgeGate } from './components/AgeGate';
import { DebugOverlay } from './components/DebugOverlay';
import './App.css';

function AppContent() {
  const [ageVerified, setAgeVerified] = useState(() => {
    return localStorage.getItem('ageVerified') === 'true';
  });
  const { user, profile, loading } = useAuth();

  const handleAgeConfirm = () => {
    localStorage.setItem('ageVerified', 'true');
    setAgeVerified(true);
  };

  const handleAgeDecline = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!ageVerified) {
    return <AgeGate onConfirm={handleAgeConfirm} onDecline={handleAgeDecline} />;
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <Routes>
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/admin" element={
        profile.role === 'admin' ? <AdminPanel /> : <Navigate to="/conversations" replace />
      } />
      <Route path="/conversations" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/wallet" element={<Dashboard />} />
      <Route path="/profile" element={<Dashboard />} />
      <Route path="/" element={<Navigate to="/conversations" replace />} />
      <Route path="*" element={<Navigate to="/conversations" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <StoriesProvider>
            <AppContent />
            <DebugOverlay />
          </StoriesProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
