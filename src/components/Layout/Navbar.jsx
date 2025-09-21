import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../context/AuthContext'
import Chatbot from '../StressRelief/Chatbot'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showChatbot, setShowChatbot] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const isActive = (path) => location.pathname === path

  return (
    <header className="navbar">
      <div className="header-logo">
        <div className="logo-icon">
          <svg width="40" height="40" viewBox="0 0 32 32" className="logo-icon-svg">
            <circle cx="16" cy="16" r="16" fill="#E8E5FF" />
            <g transform="translate(8, 8)" fill="#8B5CF6">
              <path d="M8 2C6.5 2 5 3 4.5 4.5C4 4 3 4 2.5 4.5C2 5 2 6 2.5 6.5C2 7 2 8 2.5 8.5C2 9 2 10 2.5 10.5C3 11 4 11 4.5 10.5C5 11.5 6.5 12.5 8 12.5C9.5 12.5 11 11.5 11.5 10.5C12 11 13 11 13.5 10.5C14 10 14 9 13.5 8.5C14 8 14 7 13.5 6.5C14 6 14 5 13.5 4.5C13 4 12 4 11.5 4.5C11 3 9.5 2 8 2Z" />
              <circle cx="6" cy="6" r="1" fill="#E8E5FF" />
              <circle cx="10" cy="6" r="1" fill="#E8E5FF" />
              <circle cx="8" cy="9" r="1" fill="#E8E5FF" />
            </g>
          </svg>
        </div>
        <span className="logo-text">Stud<span className="logo-highlight">AI</span></span>
      </div>

      <nav className="header-nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link
          to="/dashboard"
          className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}
        >
          Dashboard
        </Link>
        <Link
          to="/study-materials"
          className={`nav-link ${isActive('/study-materials') ? 'nav-link-active' : ''}`}
        >
          Study Materials
        </Link>
        <Link
          to="/stress-relief"
          className={`nav-link ${isActive('/stress-relief') ? 'nav-link-active' : ''}`}
        >
          Stress Relief
        </Link>
        <Link
          to="/profile"
          className={`nav-link ${isActive('/profile') ? 'nav-link-active' : ''}`}
        >
          Profile
        </Link>
        {user?.isAdmin && (
          <Link
            to="/admin"
            className={`nav-link ${isActive('/admin') ? 'nav-link-active' : ''}`}
          >
            Admin
          </Link>
        )}
      </nav>

      <div className="header-actions">
        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="ai-chatbot-btn"
          title="AI Assistant - Get help with studying"
        >
          <span>AI Assistant</span>
          <svg className="chatbot-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        <div className="user-menu-container" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="user-greeting-btn"
            title="User menu"
          >
            <span className="user-greeting">Hi, {user?.name}!</span>
            <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                <svg className="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {showChatbot && createPortal(
        <div
          className="chatbot-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowChatbot(false)
            }
          }}
        >
          <div className="chatbot-modal">
            <div className="chatbot-modal-header">
              <h3>AI Study Assistant</h3>
              <p>Get personalized study advice and motivation</p>
              <button
                className="close-chatbot"
                onClick={() => setShowChatbot(false)}
                title="Close AI Assistant"
              >
                ✕
              </button>
            </div>
            <div className="chatbot-modal-content">
              <Chatbot />
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  )
}

export default Navbar