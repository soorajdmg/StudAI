import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import './SmartCaliberAssessment.css'

// Data Collection Hook for comprehensive behavioral tracking
const useDataCollection = () => {
  const [sessionData, setSessionData] = useState({
    startTime: null,
    questionTimings: [],
    mouseMovements: [],
    clickPatterns: [],
    answerChanges: [],
    pauseEvents: [],
    confidenceRatings: [],
    breakTakingBehavior: []
  })

  const currentQuestionStartTime = useRef(null)
  const lastMousePosition = useRef({ x: 0, y: 0 })
  const mouseMovementBuffer = useRef([])
  const inactivityTimer = useRef(null)

  // Initialize session
  const initializeSession = useCallback(() => {
    setSessionData(prev => ({
      ...prev,
      startTime: Date.now()
    }))
  }, [])

  // Track question timing
  const startQuestionTimer = useCallback((questionIndex) => {
    currentQuestionStartTime.current = Date.now()

    setSessionData(prev => ({
      ...prev,
      questionTimings: [
        ...prev.questionTimings,
        {
          questionIndex,
          startTime: Date.now(),
          readingTime: null,
          answerTime: null,
          totalTime: null
        }
      ]
    }))
  }, [])

  const recordAnswerSelection = useCallback((questionIndex, answer, isChange = false) => {
    const now = Date.now()
    const questionStart = currentQuestionStartTime.current

    setSessionData(prev => {
      const updatedTimings = [...prev.questionTimings]
      const currentTiming = updatedTimings.find(t => t.questionIndex === questionIndex)

      if (currentTiming) {
        if (!currentTiming.answerTime) {
          currentTiming.answerTime = now
          currentTiming.totalTime = now - questionStart
        }
      }

      const newAnswerChanges = isChange ? [
        ...prev.answerChanges,
        {
          questionIndex,
          timestamp: now,
          newAnswer: answer,
          timeSinceQuestionStart: now - questionStart
        }
      ] : prev.answerChanges

      return {
        ...prev,
        questionTimings: updatedTimings,
        answerChanges: newAnswerChanges
      }
    })
  }, [])

  // Track mouse movements and click patterns
  const trackMouseMovement = useCallback((event) => {
    const now = Date.now()
    const { clientX, clientY } = event

    // Calculate movement speed and distance
    const distance = Math.sqrt(
      Math.pow(clientX - lastMousePosition.current.x, 2) +
      Math.pow(clientY - lastMousePosition.current.y, 2)
    )

    lastMousePosition.current = { x: clientX, y: clientY }

    mouseMovementBuffer.current.push({
      x: clientX,
      y: clientY,
      timestamp: now,
      distance
    })

    // Keep only last 100 movements to prevent memory issues
    if (mouseMovementBuffer.current.length > 100) {
      mouseMovementBuffer.current = mouseMovementBuffer.current.slice(-100)
    }
  }, [])

  const trackClick = useCallback((event, context) => {
    const now = Date.now()

    setSessionData(prev => ({
      ...prev,
      clickPatterns: [
        ...prev.clickPatterns,
        {
          timestamp: now,
          x: event.clientX,
          y: event.clientY,
          context, // 'option', 'navigation', 'other'
          target: event.target.tagName
        }
      ]
    }))
  }, [])

  // Track pauses and inactivity
  const trackInactivity = useCallback(() => {
    clearTimeout(inactivityTimer.current)

    inactivityTimer.current = setTimeout(() => {
      setSessionData(prev => ({
        ...prev,
        pauseEvents: [
          ...prev.pauseEvents,
          {
            timestamp: Date.now(),
            duration: 3000, // 3 second threshold
            type: 'inactivity'
          }
        ]
      }))
    }, 3000)
  }, [])

  // Record confidence rating
  const recordConfidence = useCallback((questionIndex, confidence) => {
    setSessionData(prev => ({
      ...prev,
      confidenceRatings: [
        ...prev.confidenceRatings,
        {
          questionIndex,
          confidence,
          timestamp: Date.now()
        }
      ]
    }))
  }, [])

  return {
    sessionData,
    initializeSession,
    startQuestionTimer,
    recordAnswerSelection,
    trackMouseMovement,
    trackClick,
    trackInactivity,
    recordConfidence
  }
}

// Main Smart Caliber Assessment Component
const SmartCaliberAssessment = () => {
  const [phase, setPhase] = useState('initial') // 'initial', 'teaching', 'testing', 'results'
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [userPreferences, setUserPreferences] = useState(null)
  const [loading, setLoading] = useState(false)
  const [caliberProfile, setCaliberProfile] = useState(null)

  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const {
    sessionData,
    initializeSession,
    startQuestionTimer,
    recordAnswerSelection,
    trackMouseMovement,
    trackClick,
    trackInactivity,
    recordConfidence
  } = useDataCollection()

  // Initialize assessment
  useEffect(() => {
    initializeSession()

    // Add global event listeners for behavioral tracking
    document.addEventListener('mousemove', trackMouseMovement)
    document.addEventListener('click', (e) => trackClick(e, 'global'))
    document.addEventListener('keypress', trackInactivity)
    document.addEventListener('scroll', trackInactivity)

    return () => {
      document.removeEventListener('mousemove', trackMouseMovement)
      document.removeEventListener('click', trackClick)
      document.removeEventListener('keypress', trackInactivity)
      document.removeEventListener('scroll', trackInactivity)
    }
  }, [initializeSession, trackMouseMovement, trackClick, trackInactivity])

  // Fetch smart questions based on user preferences
  const fetchSmartQuestions = async (preferences) => {
    try {
      setLoading(true)
      const response = await api.post('/test/smart-questions', {
        preferences,
        sessionData: sessionData
      })
      setQuestions(response.data.questions)
      setAnswers(new Array(response.data.questions.length).fill(''))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching smart questions:', error)
      setLoading(false)
    }
  }

  // Handle initial preference selection
  const handlePreferenceSelection = async (preferences) => {
    setUserPreferences(preferences)
    await fetchSmartQuestions(preferences)
    setPhase('testing')
    startQuestionTimer(0)
  }

  // Enhanced answer selection with comprehensive tracking
  const handleAnswerSelect = (answer) => {
    const previousAnswer = answers[currentQuestion]
    const isChange = previousAnswer && previousAnswer !== answer

    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answer
    setAnswers(newAnswers)

    recordAnswerSelection(currentQuestion, answer, isChange)
  }

  // Navigation with timing tracking
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      startQuestionTimer(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      startQuestionTimer(currentQuestion)
    }
  }

  // Submit assessment with comprehensive analysis
  const handleSubmit = async () => {
    try {
      setLoading(true)

      const response = await api.post('/test/smart-caliber-analysis', {
        answers,
        sessionData,
        userPreferences,
        userId: user?.id
      })

      const { caliberProfile: profile, insights, recommendations } = response.data

      // Update user profile
      await api.put('/users/profile', {
        caliberProfile: profile,
        sessionData,
        testAnswers: answers
      })

      updateUser({ caliberProfile: profile })
      setCaliberProfile({ profile, insights, recommendations })
      setPhase('results')
    } catch (error) {
      console.error('Error analyzing caliber:', error)
      alert('Error analyzing your learning caliber. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Render initial preference selection
  const renderPreferenceSelection = () => (
    <div className="caliber-container">
      <div className="caliber-card">
        <div className="caliber-header">
          <h2>🎯 Smart Caliber Assessment</h2>
          <p>Let's discover your unique learning caliber through intelligent analysis</p>
        </div>

        <div className="preference-selection">
          <h3>First, tell us your preferred learning style:</h3>
          <div className="preference-options">
            <div
              className="preference-option"
              onClick={() => handlePreferenceSelection({
                primary: 'visual',
                secondary: 'text',
                preferredPace: 'moderate'
              })}
            >
              <div className="preference-icon">👁️</div>
              <h4>Visual Learner</h4>
              <p>I learn best with diagrams, charts, and visual representations</p>
            </div>

            <div
              className="preference-option"
              onClick={() => handlePreferenceSelection({
                primary: 'auditory',
                secondary: 'visual',
                preferredPace: 'moderate'
              })}
            >
              <div className="preference-icon">🎧</div>
              <h4>Auditory Learner</h4>
              <p>I prefer listening to explanations and verbal instructions</p>
            </div>

            <div
              className="preference-option"
              onClick={() => handlePreferenceSelection({
                primary: 'text',
                secondary: 'visual',
                preferredPace: 'detailed'
              })}
            >
              <div className="preference-icon">📖</div>
              <h4>Reading/Writing Learner</h4>
              <p>I learn through reading and taking detailed notes</p>
            </div>

            <div
              className="preference-option"
              onClick={() => handlePreferenceSelection({
                primary: 'kinesthetic',
                secondary: 'visual',
                preferredPace: 'interactive'
              })}
            >
              <div className="preference-icon">🤲</div>
              <h4>Hands-on Learner</h4>
              <p>I learn by doing and interactive experiences</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render testing phase
  const renderTesting = () => {
    if (loading) {
      return (
        <div className="caliber-container">
          <div className="loading-spinner"></div>
          <p>Preparing your personalized assessment...</p>
        </div>
      )
    }

    const progress = ((currentQuestion + 1) / questions.length) * 100

    return (
      <div className="caliber-container">
        <div className="caliber-card">
          <div className="caliber-header">
            <h2>Smart Caliber Assessment</h2>
            <p>Advanced learning pattern analysis in progress...</p>

            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="progress-text">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
          </div>

          <div className="question-container">
            <div className="question-metadata">
              <span className="question-type">
                {questions[currentQuestion]?.type || 'Assessment'}
              </span>
              <span className="difficulty">
                {questions[currentQuestion]?.difficulty || 'Medium'}
              </span>
            </div>

            <h3 className="question-text">
              {questions[currentQuestion]?.question}
            </h3>

            {questions[currentQuestion]?.context && (
              <div className="question-context">
                <div dangerouslySetInnerHTML={{
                  __html: questions[currentQuestion].context
                }} />
              </div>
            )}

            <div className="options-container">
              {questions[currentQuestion]?.options.map((option, index) => (
                <div
                  key={index}
                  className={`option ${answers[currentQuestion] === option.value ? 'selected' : ''}`}
                  onClick={(e) => {
                    trackClick(e, 'option')
                    handleAnswerSelect(option.value)
                  }}
                >
                  <div className="option-radio">
                    {answers[currentQuestion] === option.value && <div className="option-dot"></div>}
                  </div>
                  <span className="option-text">{option.text}</span>
                </div>
              ))}
            </div>

            {/* Confidence Rating */}
            <div className="confidence-rating">
              <p>How confident are you in this answer?</p>
              <div className="confidence-options">
                {['Not Sure', 'Somewhat Sure', 'Confident', 'Very Confident'].map((level, index) => (
                  <button
                    key={index}
                    className="confidence-btn"
                    onClick={() => recordConfidence(currentQuestion, index + 1)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="test-navigation">
            <button
              onClick={handlePrevious}
              className="nav-button secondary"
              disabled={currentQuestion === 0}
            >
              Previous
            </button>

            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="nav-button primary"
                disabled={!answers[currentQuestion]}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="nav-button primary"
                disabled={!answers[currentQuestion] || loading}
              >
                {loading ? 'Analyzing...' : 'Complete Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render results
  const renderResults = () => (
    <div className="caliber-container">
      <div className="results-card">
        <div className="results-header">
          <h2>🎯 Your Learning Caliber Profile</h2>
          <p>Based on comprehensive behavioral and performance analysis</p>
        </div>

        {caliberProfile && (
          <div className="caliber-results">
            <div className="caliber-type">
              <h3>{caliberProfile.profile.type}</h3>
              <p>{caliberProfile.profile.description}</p>
            </div>

            <div className="caliber-insights">
              <h4>Key Insights:</h4>
              <ul>
                {caliberProfile.insights?.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>

            <div className="caliber-recommendations">
              <h4>Personalized Recommendations:</h4>
              <ul>
                {caliberProfile.recommendations?.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/dashboard')}
          className="continue-button"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  )

  // Main render logic
  switch (phase) {
    case 'initial':
      return renderPreferenceSelection()
    case 'testing':
      return renderTesting()
    case 'results':
      return renderResults()
    default:
      return renderPreferenceSelection()
  }
}

export default SmartCaliberAssessment