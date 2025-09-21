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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading StudAI...</p>
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