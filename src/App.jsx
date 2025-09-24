import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'

// Components
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import LearningTest from './components/LearningTest/LearningTest'
import LearningCurveTest from './components/LearningCurveTest/LearningCurveTest'
import Dashboard from './components/Dashboard/Dashboard'
import StressRelief from './components/StressRelief/StressRelief'
import ProfileSection from './components/ProfileSection/ProfileSection'
import StudyMaterials from './components/StudyMaterials/StudyMaterials'
import AdminDashboard from './components/Admin/AdminDashboard'
import Navbar from './components/Layout/Navbar'
import StudAILanding from './components/LandingPage/StudAILanding'

// Context
import { AuthProvider, useAuth } from './context/AuthContext'

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Skip loading screen for landing page visitors who don't need authentication
  const isLandingPage = location.pathname === '/';
  const shouldShowLoading = loading && !isLandingPage;

  if (shouldShowLoading) {
    return (
      <div className="loading-container">
        {/* Background decorative circles */}
        <div className="loading-bg-decoration loading-circle-1"></div>
        <div className="loading-bg-decoration loading-circle-2"></div>
        <div className="loading-bg-decoration loading-circle-3"></div>

        {/* Spiral decoration */}
        <div className="loading-spiral">
          <svg width="60" height="60" viewBox="0 0 80 80">
            <path d="M40 10 C60 10, 70 30, 70 40 C70 60, 50 70, 40 70 C20 70, 10 50, 10 40 C10 20, 30 10, 40 10 Z"
              fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>

        {/* StudAI Logo */}
        <div className="loading-logo">
          <div className="loading-logo-icon">
            <svg width="48" height="48" viewBox="0 0 32 32" className="loading-logo-svg">
              <circle cx="16" cy="16" r="16" fill="#E8E5FF" />
              <g transform="translate(8, 8)" fill="#8B5CF6">
                <path d="M8 2C6.5 2 5 3 4.5 4.5C4 4 3 4 2.5 4.5C2 5 2 6 2.5 6.5C2 7 2 8 2.5 8.5C2 9 2 10 2.5 10.5C3 11 4 11 4.5 10.5C5 11.5 6.5 12.5 8 12.5C9.5 12.5 11 11.5 11.5 10.5C12 11 13 11 13.5 10.5C14 10 14 9 13.5 8.5C14 8 14 7 13.5 6.5C14 6 14 5 13.5 4.5C13 4 12 4 11.5 4.5C11 3 9.5 2 8 2Z" />
                <circle cx="6" cy="6" r="1" fill="#E8E5FF" />
                <circle cx="10" cy="6" r="1" fill="#E8E5FF" />
                <circle cx="8" cy="9" r="1" fill="#E8E5FF" />
              </g>
            </svg>
          </div>
          <span className="loading-logo-text">Stud<span className="loading-logo-highlight">AI</span></span>
        </div>

        {/* Main loading elements */}
        <div className="loading-elements">
          {/* Minimal spinner */}
          <div className="loading-spinner"></div>

          {/* Floating hashtags */}
          <div className="loading-hashtags">
            <span className="loading-hashtag">#AI-powered</span>
            <span className="loading-hashtag">#adaptive</span>
            <span className="loading-hashtag">#personalized</span>
          </div>

          {/* Loading text */}
          <div className="loading-text">Initializing StudAI...</div>
          <div className="loading-subtext">Preparing your personalized learning experience</div>
        </div>
      </div>
    );
  }

  // Don't show main navbar on landing page since it has its own header
  const shouldShowNavbar = user && location.pathname !== '/';

  return (
    <div className="App">
      {shouldShowNavbar && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={<StudAILanding />}
        />
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/dashboard" />}
        />

        {/* Protected routes */}
        <Route
          path="/test"
          element={user ? <LearningTest /> : <Navigate to="/" />}
        />
        <Route
          path="/calibre-test"
          element={user ? <LearningCurveTest /> : <Navigate to="/" />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/stress-relief"
          element={user ? <StressRelief /> : <Navigate to="/" />}
        />
        <Route
          path="/study-materials"
          element={user ? <StudyMaterials /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={user ? <ProfileSection /> : <Navigate to="/" />}
        />
        <Route
          path="/admin"
          element={user && user.isAdmin ? <AdminDashboard /> : <Navigate to="/dashboard" />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App