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
      <div className="test-container">
        <div className="loading-spinner"></div>
        <p>Loading learning style assessment...</p>
      </div>
    )
  }

  if (result) {
    return (
      <div className="test-container">
        <div className="result-card">
          <div className="result-header">
            <div className="result-icon">{result.profile.icon}</div>
            <h2>Your Learning Style</h2>
            <h3>{result.profile.type}</h3>
          </div>

          <div className="result-description">
            <p>{result.profile.description}</p>
          </div>

          <div className="result-tips">
            <h4>Personalized Learning Tips:</h4>
            <ul>
              {result.profile.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleContinue}
            className="continue-button"
          >
            Continue to Calibre Test
          </button>
        </div>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="test-container">
      <div className="test-card">
        <div className="test-header">
          <h2>Learning Style Assessment</h2>
          <p>Answer these questions to discover your personalized learning style</p>

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
          <h3 className="question-text">
            {questions[currentQuestion]?.question}
          </h3>

          <div className="options-container">
            {questions[currentQuestion]?.options.map((option, index) => (
              <div
                key={index}
                className={`option ${answers[currentQuestion] === option.value ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(option.value)}
              >
                <div className="option-radio">
                  {answers[currentQuestion] === option.value && <div className="option-dot"></div>}
                </div>
                <span className="option-text">{option.text}</span>
              </div>
            ))}
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
              disabled={!answers[currentQuestion] || submitting}
            >
              {submitting ? 'Calculating...' : 'Get My Results'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LearningTest