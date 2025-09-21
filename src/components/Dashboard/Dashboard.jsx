import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const [studyMaterials, setStudyMaterials] = useState([])

  const generateStudyMaterials = () => {
    if (!user?.learningProfile) return

    const materials = {
      visual: [
        {
          title: "Interactive Mind Maps",
          description: "Create visual connections between concepts",
          type: "Tool",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM8 7C9.1 7 10 7.9 10 9C10 10.1 9.1 11 8 11C6.9 11 6 10.1 6 9C6 7.9 6.9 7 8 7ZM16 7C17.1 7 18 7.9 18 9C18 10.1 17.1 11 16 11C14.9 11 14 10.1 14 9C14 7.9 14.9 7 16 7ZM12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13ZM4 18C5.1 18 6 18.9 6 20C6 21.1 5.1 22 4 22C2.9 22 2 21.1 2 20C2 18.9 2.9 18 4 18ZM20 18C21.1 18 22 18.9 22 20C22 21.1 21.1 22 20 22C18.9 22 18 21.1 18 20C18 18.9 18.9 18 20 18Z"/>
            </svg>
          )
        },
        {
          title: "Diagram-Based Learning",
          description: "Visual representations of complex topics",
          type: "Method",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4H20V16H4V4ZM4 2C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H11V20H9V22H15V20H13V18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2H4Z"/>
            </svg>
          )
        },
        {
          title: "Color-Coded Notes",
          description: "Organize information with colors and highlights",
          type: "Technique",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"/>
            </svg>
          )
        },
        {
          title: "Infographic Study Guides",
          description: "Transform text into visual study materials",
          type: "Resource",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6H2V20C2 21.1 2.9 22 4 22H18V20H4V6ZM20 2H8C6.9 2 6 2.9 6 4V16C6 17.1 6.9 18 8 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H8V4H20V16Z"/>
            </svg>
          )
        }
      ],
      auditory: [
        {
          title: "Study Podcasts",
          description: "Audio content for your subjects",
          type: "Resource",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1C9.8 1 8 2.8 8 5V11C8 13.2 9.8 15 12 15S16 13.2 16 11V5C16 2.8 14.2 1 12 1ZM19 11C19 15 15.7 18.1 11.8 18.9V21H13V23H11V23H9V21H10.2V18.9C6.3 18.1 3 15 3 11H5C5 14.3 7.7 17 11 17S17 14.3 17 11H19Z"/>
            </svg>
          )
        },
        {
          title: "Voice Recording Notes",
          description: "Record and replay your study sessions",
          type: "Tool",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5V19L13 16V8L8 5ZM9 7.08L11 8.15V14.85L9 15.92V7.08ZM16 4H18V20H16V4Z"/>
            </svg>
          )
        },
        {
          title: "Discussion Groups",
          description: "Learn through conversation and debate",
          type: "Method",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12C15.7 12 15.4 12 15.1 11.9L12.9 13.4C13 13.6 13 13.8 13 14C13 16.2 11.2 18 9 18S5 16.2 5 14S6.8 10 9 10C9.3 10 9.6 10 9.9 10.1L12.1 8.6C12 8.4 12 8.2 12 8C12 5.8 13.8 4 16 4Z"/>
            </svg>
          )
        },
        {
          title: "Music-Based Memory",
          description: "Use rhythm and melody to remember facts",
          type: "Technique",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3V13.5C11.4 13.2 10.7 13 10 13C7.8 13 6 14.8 6 17S7.8 21 10 21 14 19.2 14 17V7H18V5H12V3Z"/>
            </svg>
          )
        }
      ],
      kinesthetic: [
        {
          title: "Interactive Flashcards",
          description: "Physical manipulation of study materials",
          type: "Tool",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z"/>
            </svg>
          )
        },
        {
          title: "Study-Walk Sessions",
          description: "Learn while moving and walking",
          type: "Method",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 5.5C14.6 5.5 15.5 4.6 15.5 3.5S14.6 1.5 13.5 1.5 11.5 2.4 11.5 3.5 12.4 5.5 13.5 5.5ZM9.8 8.9L7 23H9.1L10.9 15L13 17V23H15V15.5L12.9 13.5L13.5 10.5C14.8 12 16.8 13 19 13V11C17.1 11 15.5 10 14.7 8.6L13.7 7C13.3 6.4 12.7 6 12 6S10.7 6.4 10.3 7L7.8 10.5L9.8 8.9Z"/>
            </svg>
          )
        },
        {
          title: "Hands-On Experiments",
          description: "Learn by doing and experiencing",
          type: "Activity",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 2V7.5L12 10.5L15 7.5V2H9ZM11 4H13V6H11V4ZM3 6V8H6V6H3ZM18 6V8H21V6H18ZM12 12L9 15H15L12 12ZM5.6 10.6L8 13L6.4 14.6L4 12.2L5.6 10.6ZM18.4 10.6L20 12.2L17.6 14.6L16 13L18.4 10.6ZM12 16L15 19V22H9V19L12 16Z"/>
            </svg>
          )
        },
        {
          title: "Gesture-Based Learning",
          description: "Use body movements to reinforce memory",
          type: "Technique",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4S13.1 6 12 6 10 5.1 10 4 10.9 2 12 2ZM18 9V7H15L13.5 7.5C13.1 7.6 12.7 7.9 12.5 8.3L11.2 10.9L10 10L8.6 11.5L11.1 13.8L12.5 11C12.6 10.8 12.6 10.7 12.6 10.5L13.6 8.6L15.7 9.4L17.2 11H19L17.2 8.2L18 9Z"/>
            </svg>
          )
        }
      ],
      mixed: [
        {
          title: "Multimodal Study Plan",
          description: "Combine visual, audio, and hands-on methods",
          type: "Strategy",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"/>
            </svg>
          )
        },
        {
          title: "Adaptive Learning Tools",
          description: "Resources that adjust to your preferences",
          type: "Tool",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 2V13H10V22L17 10H13L17 2H7Z"/>
            </svg>
          )
        },
        {
          title: "Varied Study Sessions",
          description: "Switch between different learning styles",
          type: "Method",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4V1L8 5L12 9V6C15.31 6 18 8.69 18 12C18 13.01 17.75 13.97 17.3 14.8L18.76 16.26C19.54 15.03 20 13.57 20 12C20 7.58 16.42 4 12 4ZM12 18C8.69 18 6 15.31 6 12C6 10.99 6.25 10.03 6.7 9.2L5.24 7.74C4.46 8.97 4 10.43 4 12C4 16.42 7.58 20 12 20V23L16 19L12 15V18Z"/>
            </svg>
          )
        },
        {
          title: "Comprehensive Resources",
          description: "All-in-one study materials and guides",
          type: "Resource",
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12H12V17H17V12ZM11 12H7V13H11V12ZM7 14H11V15H7V14ZM7 16H11V17H7V16Z"/>
            </svg>
          )
        }
      ]
    }

    setStudyMaterials(materials[user.learningProfile] || materials.mixed)
  }

  useEffect(() => {
    generateStudyMaterials()
  }, [user?.learningProfile])

  const updateProgress = async (increment) => {
    try {
      await api.put('/users/progress', { tasksCompleted: increment })
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const markAsCompleted = (index) => {
    updateProgress(1)
    const newMaterials = [...studyMaterials]
    newMaterials[index].completed = true
    setStudyMaterials(newMaterials)
  }

  const getProfileInfo = () => {
    const profiles = {
      visual: {
        type: 'Visual Learner',
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 9C13.38 9 14.5 8.38 14.5 7.5S13.38 6 12 6 9.5 6.62 9.5 7.5 10.62 9 12 9ZM12 4.5C15.31 4.5 18 6.69 18 9.5C18 11.54 16.54 13.26 14.5 14.1V16H13V14.46C12.67 14.5 12.34 14.5 12 14.5S11.33 14.5 11 14.46V16H9.5V14.1C7.46 13.26 6 11.54 6 9.5C6 6.69 8.69 4.5 12 4.5ZM12 11C15.31 11 18 13.69 18 17V19H6V17C6 13.69 8.69 11 12 11Z"/>
          </svg>
        ),
        color: 'var(--accent-400)'
      },
      auditory: {
        type: 'Auditory Learner',
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1C9.8 1 8 2.8 8 5V11C8 13.2 9.8 15 12 15S16 13.2 16 11V5C16 2.8 14.2 1 12 1ZM19 11C19 15 15.7 18.1 11.8 18.9V21H13V23H11V23H9V21H10.2V18.9C6.3 18.1 3 15 3 11H5C5 14.3 7.7 17 11 17S17 14.3 17 11H19Z"/>
          </svg>
        ),
        color: 'var(--success-400)'
      },
      kinesthetic: {
        type: 'Kinesthetic Learner',
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.5 5.5C14.6 5.5 15.5 4.6 15.5 3.5S14.6 1.5 13.5 1.5 11.5 2.4 11.5 3.5 12.4 5.5 13.5 5.5ZM9.8 8.9L7 23H9.1L10.9 15L13 17V23H15V15.5L12.9 13.5L13.5 10.5C14.8 12 16.8 13 19 13V11C17.1 11 15.5 10 14.7 8.6L13.7 7C13.3 6.4 12.7 6 12 6S10.7 6.4 10.3 7L7.8 10.5L9.8 8.9Z"/>
          </svg>
        ),
        color: '#DC2626'
      },
      mixed: {
        type: 'Mixed Learner',
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"/>
          </svg>
        ),
        color: '#7C3AED'
      }
    }
    return profiles[user?.learningProfile] || profiles.mixed
  }

  const profileInfo = getProfileInfo()
  const completedTasks = studyMaterials.filter(material => material.completed).length
  const progressPercentage = studyMaterials.length > 0 ? (completedTasks / studyMaterials.length) * 100 : 0

  if (!user?.learningProfile) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="welcome-card">
            <h2>Welcome to StudAI, {user?.name}!</h2>
            <p>To get personalized study recommendations, please complete our learning style assessment.</p>
            <Link to="/test" className="cta-button">
              Take Learning Style Test
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-main-content">
        <div className="profile-section">
          <div className="profile-badge" style={{ backgroundColor: profileInfo.color }}>
            <span className="profile-icon">{profileInfo.icon}</span>
            <div className="profile-info">
              <h3>{profileInfo.type}</h3>
              <p>Personalized for your learning style</p>
            </div>
          </div>

          <div className="progress-section">
            <h4>Your Progress</h4>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${progressPercentage}%`,
                    backgroundColor: profileInfo.color
                  }}
                ></div>
              </div>
              <span className="progress-text">
                {completedTasks}/{studyMaterials.length} completed ({Math.round(progressPercentage)}%)
              </span>
            </div>
          </div>

          {user?.learningCurveProfile && (
            <div className="learning-curve-section">
              <h4>Your Learning Speed</h4>
              <div className="learning-curve-badge">
                <div className="curve-icon">
                  {user.learningCurveProfile.speed === 'Fast' ? '🚀' :
                   user.learningCurveProfile.speed === 'Average' ? '📈' : '🎯'}
                </div>
                <div className="curve-info">
                  <span className="curve-type">{user.learningCurveProfile.type}</span>
                  <span className="curve-stats">
                    {user.learningCurveProfile.accuracy.toFixed(0)}% accuracy •
                    {user.learningCurveProfile.speed} learner
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="quick-actions">
          <Link to="/stress-relief" className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.8 2 15.8 2.7 17.6 4.9c1.8 2.2 2.4 4.8 2.4 7.1 0 4.4-3.6 8-8 8s-8-3.6-8-8c0-2.3.6-4.9 2.4-7.1C8.2 2.7 10.2 2 12 2z"/>
              </svg>
            </div>
            <div>
              <h4>Wellness Hub</h4>
              <p>Focus tools and relaxation</p>
            </div>
          </Link>
          <Link to="/test" className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4V1L8 5L12 9V6C15.31 6 18 8.69 18 12C18 13.01 17.75 13.97 17.3 14.8L18.76 16.26C19.54 15.03 20 13.57 20 12C20 7.58 16.42 4 12 4Z"/>
              </svg>
            </div>
            <div>
              <h4>Retake Assessment</h4>
              <p>Update your learning profile</p>
            </div>
          </Link>
          {user?.learningProfile && (
            <Link to="/calibre-test" className="action-card">
              <div className="action-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 4L9 4V16L3 16V4ZM5 6L5 14L7 14L7 6L5 6ZM11 7L17 7V19L11 19V7ZM13 9L13 17L15 17L15 9L13 9ZM19 2L19 14L21 14L21 2L19 2Z"/>
                </svg>
              </div>
              <div>
                <h4>{user?.learningCurveProfile ? 'Retake Calibre Test' : 'Calibre Test'}</h4>
                <p>{user?.learningCurveProfile ? `Your speed: ${user.learningCurveProfile.speed}` : 'Discover your learning speed'}</p>
              </div>
            </Link>
          )}
        </div>
        </div>

        <div className="study-materials-section">
          <div className="materials-header">
            <h3>AI-Powered Study Materials</h3>
            <p>Transform your documents into intelligent learning experiences</p>
          </div>
          <div className="materials-preview">
            <div className="preview-features">
              <div className="feature-item">
                <span className="feature-icon">📄</span>
                <div>
                  <h4>Document Analysis</h4>
                  <p>AI analyzes your study materials and extracts key concepts</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💬</span>
                <div>
                  <h4>AI Tutor Chat</h4>
                  <p>Ask questions and get personalized study guidance</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📝</span>
                <div>
                  <h4>Smart Quizzes</h4>
                  <p>Generate adaptive quizzes from your documents</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📅</span>
                <div>
                  <h4>Study Planner</h4>
                  <p>Create personalized study schedules with AI</p>
                </div>
              </div>
            </div>
            <Link to="/study-materials" className="explore-materials-button">
              Explore AI Study Materials
            </Link>
          </div>
        </div>

        <div className="motivational-section">
          <div className="motivational-card">
            <h4>Keep Going!</h4>
            <p>
              {progressPercentage === 100
                ? "Amazing! You've completed all your study materials. Time to explore stress relief tools!"
                : progressPercentage >= 50
                ? "You're making great progress! Keep up the excellent work!"
                : "Every expert was once a beginner. You're on the right track!"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard