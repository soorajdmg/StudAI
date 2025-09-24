import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import './LearningTest.css'

const LearningTest = () => {
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const { updateUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/test/questions')
      setQuestions(response.data.questions)
      setAnswers(new Array(response.data.questions.length).fill(''))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching questions:', error)
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answer) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answer
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (answers.includes('')) {
      alert('Please answer all questions before submitting.')
      return
    }

    setSubmitting(true)

    try {
      const response = await api.post('/test/calculate', { answers })
      const { learningProfile, profile } = response.data

      // Update user profile
      await api.put('/users/profile', {
        learningProfile,
        testAnswers: answers.map((answer, index) => ({
          question: index + 1,
          answer
        }))
      })

      updateUser({ learningProfile })
      setResult({ learningProfile, profile })
    } catch (error) {
      console.error('Error submitting test:', error)
      alert('Error submitting test. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleContinue = () => {
    navigate('/calibre-test')
  }

  if (loading) {
    return (
      <div className="test-page">
        <div className="test-container">
          <div className="loading-card">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <div className="loading-content">
              <h3>Preparing Your Assessment</h3>
              <p>Getting ready to discover your unique learning style...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="test-page">
        <div className="test-container">
          <div className="result-card">
            <div className="result-celebration">
              <div className="celebration-rings">
                <div className="ring ring-1"></div>
                <div className="ring ring-2"></div>
                <div className="ring ring-3"></div>
              </div>
              <div className="result-icon">{result.profile.icon}</div>
            </div>

            <div className="result-header">
              <div className="result-badge">
                <span className="badge-text">Assessment Complete</span>
              </div>
              <h2>Your Learning Style</h2>
              <h3>{result.profile.type}</h3>
            </div>

            <div className="result-description">
              <p>{result.profile.description}</p>
            </div>

            <div className="result-tips">
              <div className="tips-header">
                <div className="tips-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h4>Personalized Learning Tips</h4>
              </div>
              <div className="tips-grid">
                {result.profile.tips.map((tip, index) => (
                  <div key={index} className="tip-card">
                    <div className="tip-number">{index + 1}</div>
                    <p>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="result-actions">
              <button
                onClick={handleContinue}
                className="continue-button primary"
              >
                <span>Continue to Calibre Test</span>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="continue-button secondary"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="test-page">
      <div className="test-container">
        <div className="test-card">
          <div className="test-header">
            <div className="header-decoration">
              <div className="decoration-circle"></div>
              <div className="decoration-line"></div>
            </div>

            <div className="header-content">
              <div className="test-badge">
                <span className="badge-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7V9L21 9ZM3 9V7L9 7V9L3 9ZM15 11.5C16.1 11.5 17 12.4 17 13.5C17 14.6 16.1 15.5 15 15.5C13.9 15.5 13 14.6 13 13.5C13 12.4 13.9 11.5 15 11.5ZM9 11.5C10.1 11.5 11 12.4 11 13.5C11 14.6 10.1 15.5 9 15.5C7.9 15.5 7 14.6 7 13.5C7 12.4 7.9 11.5 9 11.5ZM12 20C10.9 20 10 19.1 10 18C10 16.9 10.9 16 12 16C13.1 16 14 16.9 14 18C14 19.1 13.1 20 12 20Z"/>
                  </svg>
                </span>
                <span>Learning Assessment</span>
              </div>
              <h1>Discover Your Learning Style</h1>
              <p>Answer these carefully crafted questions to unlock personalized study recommendations tailored just for you</p>
            </div>

            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-label">Progress</span>
                <span className="progress-counter">
                  {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
                <div className="progress-glow" style={{ left: `${progress}%` }}></div>
              </div>
              <div className="progress-percentage">{Math.round(progress)}% Complete</div>
            </div>
          </div>

          <div className="question-section">
            <div className="question-header">
              <div className="question-number">
                <span>{currentQuestion + 1}</span>
              </div>
              <h2 className="question-text">
                {questions[currentQuestion]?.question}
              </h2>
            </div>

            <div className="options-grid">
              {questions[currentQuestion]?.options.map((option, index) => (
                <div
                  key={index}
                  className={`option-card ${answers[currentQuestion] === option.value ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(option.value)}
                >
                  <div className="option-header">
                    <div className="option-radio">
                      <div className="radio-outer">
                        <div className="radio-inner">
                          {answers[currentQuestion] === option.value && (
                            <div className="radio-dot"></div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="option-letter">{String.fromCharCode(65 + index)}</div>
                  </div>
                  <p className="option-text">{option.text}</p>
                  <div className="option-select-indicator">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="navigation-section">
            <button
              onClick={handlePrevious}
              className={`nav-btn secondary ${currentQuestion === 0 ? 'disabled' : ''}`}
              disabled={currentQuestion === 0}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
              </svg>
              <span>Previous</span>
            </button>

            <div className="question-dots">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`question-dot ${
                    index < currentQuestion ? 'completed' :
                    index === currentQuestion ? 'current' : 'upcoming'
                  }`}
                >
                  {index < currentQuestion && (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </div>
              ))}
            </div>

            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className={`nav-btn primary ${!answers[currentQuestion] ? 'disabled' : ''}`}
                disabled={!answers[currentQuestion]}
              >
                <span>Next</span>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className={`nav-btn submit ${!answers[currentQuestion] || submitting ? 'disabled' : ''}`}
                disabled={!answers[currentQuestion] || submitting}
              >
                {submitting ? (
                  <>
                    <div className="button-spinner"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Get My Results</span>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearningTest