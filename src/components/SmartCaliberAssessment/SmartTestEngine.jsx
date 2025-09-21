import { useState, useEffect, useRef } from 'react'
import './SmartTestEngine.css'

// Smart Question Generator with Sequencing Logic
const SmartQuestionGenerator = () => {
  // Question bank with different formats and difficulties
  const questionBank = {
    easy: {
      visual: [
        {
          id: 'v_easy_1',
          question: 'Look at this pattern. What comes next?',
          type: 'visual_pattern',
          difficulty: 'easy',
          format: 'visual',
          context: `
            <div class="pattern-sequence">
              <div class="pattern-item circle blue"></div>
              <div class="pattern-item square red"></div>
              <div class="pattern-item circle blue"></div>
              <div class="pattern-item square red"></div>
              <div class="pattern-item">?</div>
            </div>
          `,
          options: [
            { value: 'A', text: 'Blue Circle', correct: true },
            { value: 'B', text: 'Red Square', correct: false },
            { value: 'C', text: 'Green Triangle', correct: false },
            { value: 'D', text: 'Yellow Star', correct: false }
          ]
        },
        {
          id: 'v_easy_2',
          question: 'Which shape has the most sides?',
          type: 'visual_analysis',
          difficulty: 'easy',
          format: 'visual',
          context: `
            <div class="shapes-container">
              <div class="shape triangle"></div>
              <div class="shape square"></div>
              <div class="shape pentagon"></div>
              <div class="shape circle"></div>
            </div>
          `,
          options: [
            { value: 'A', text: 'Triangle', correct: false },
            { value: 'B', text: 'Square', correct: false },
            { value: 'C', text: 'Pentagon', correct: true },
            { value: 'D', text: 'Circle', correct: false }
          ]
        }
      ],
      auditory: [
        {
          id: 'a_easy_1',
          question: 'Listen to the sequence and identify the pattern.',
          type: 'auditory_pattern',
          difficulty: 'easy',
          format: 'auditory',
          audioContent: {
            sequence: ['high', 'low', 'high', 'low'],
            nextSound: 'high'
          },
          context: `
            <div class="audio-instructions">
              <p>🔊 Click play to hear a sound sequence</p>
              <button class="audio-play-btn" onclick="playSequence()">▶️ Play Sequence</button>
            </div>
          `,
          options: [
            { value: 'A', text: 'High tone', correct: true },
            { value: 'B', text: 'Low tone', correct: false },
            { value: 'C', text: 'Medium tone', correct: false },
            { value: 'D', text: 'No sound', correct: false }
          ]
        }
      ],
      text: [
        {
          id: 't_easy_1',
          question: 'Read the following passage and answer: What is the main idea?',
          type: 'reading_comprehension',
          difficulty: 'easy',
          format: 'text',
          context: `
            <div class="reading-passage">
              <p>The sun is a star at the center of our solar system. It provides light and heat to Earth, making life possible. Plants use sunlight to make food through photosynthesis, and this energy flows through the entire food chain.</p>
            </div>
          `,
          options: [
            { value: 'A', text: 'The sun is important for life on Earth', correct: true },
            { value: 'B', text: 'Plants are green', correct: false },
            { value: 'C', text: 'Earth has a solar system', correct: false },
            { value: 'D', text: 'Food chains exist', correct: false }
          ]
        }
      ]
    },
    medium: {
      visual: [
        {
          id: 'v_med_1',
          question: 'Analyze this data visualization. What trend do you observe?',
          type: 'data_analysis',
          difficulty: 'medium',
          format: 'visual',
          context: `
            <div class="chart-container">
              <svg viewBox="0 0 300 200" class="trend-chart">
                <polyline points="50,150 100,120 150,100 200,80 250,60"
                          stroke="#667eea" stroke-width="3" fill="none"/>
                <circle cx="50" cy="150" r="4" fill="#667eea"/>
                <circle cx="100" cy="120" r="4" fill="#667eea"/>
                <circle cx="150" cy="100" r="4" fill="#667eea"/>
                <circle cx="200" cy="80" r="4" fill="#667eea"/>
                <circle cx="250" cy="60" r="4" fill="#667eea"/>
              </svg>
            </div>
          `,
          options: [
            { value: 'A', text: 'Steady upward trend', correct: true },
            { value: 'B', text: 'Downward trend', correct: false },
            { value: 'C', text: 'No clear pattern', correct: false },
            { value: 'D', text: 'Cyclical pattern', correct: false }
          ]
        }
      ],
      text: [
        {
          id: 't_med_1',
          question: 'Based on the passage, what can you infer about the author\'s perspective?',
          type: 'inference',
          difficulty: 'medium',
          format: 'text',
          context: `
            <div class="reading-passage">
              <p>While technology has revolutionized communication, allowing instant global connectivity, some argue that it has diminished the quality of human interaction. Face-to-face conversations have become less frequent, replaced by brief text messages and emoji-filled exchanges that may lack the nuance of traditional communication.</p>
            </div>
          `,
          options: [
            { value: 'A', text: 'Technology is purely beneficial', correct: false },
            { value: 'B', text: 'The author sees both benefits and drawbacks of technology', correct: true },
            { value: 'C', text: 'Traditional communication should be abandoned', correct: false },
            { value: 'D', text: 'Emojis are the future of communication', correct: false }
          ]
        }
      ]
    },
    hard: {
      visual: [
        {
          id: 'v_hard_1',
          question: 'This complex diagram shows relationships between concepts. Which connection is logically inconsistent?',
          type: 'logical_analysis',
          difficulty: 'hard',
          format: 'visual',
          context: `
            <div class="concept-map">
              <div class="concept-network">
                <div class="concept-node" data-concept="A">Energy</div>
                <div class="concept-node" data-concept="B">Matter</div>
                <div class="concept-node" data-concept="C">Motion</div>
                <div class="concept-node" data-concept="D">Time</div>
                <div class="connection" data-from="A" data-to="C">Enables</div>
                <div class="connection" data-from="B" data-to="A">Contains</div>
                <div class="connection" data-from="C" data-to="D">Requires</div>
                <div class="connection" data-from="D" data-to="B">Creates</div>
              </div>
            </div>
          `,
          options: [
            { value: 'A', text: 'Energy enables Motion', correct: false },
            { value: 'B', text: 'Matter contains Energy', correct: false },
            { value: 'C', text: 'Motion requires Time', correct: false },
            { value: 'D', text: 'Time creates Matter', correct: true }
          ]
        }
      ],
      text: [
        {
          id: 't_hard_1',
          question: 'Analyze this complex argument and identify the logical fallacy:',
          type: 'critical_thinking',
          difficulty: 'hard',
          format: 'text',
          context: `
            <div class="argument-passage">
              <p>"Every successful entrepreneur I know wakes up before 6 AM. My friend Jake wakes up at 5:30 AM every day. Therefore, Jake will definitely become a successful entrepreneur. Additionally, since all the unsuccessful people I've met wake up late, anyone who sleeps in past 7 AM is doomed to fail in business."</p>
            </div>
          `,
          options: [
            { value: 'A', text: 'Hasty generalization', correct: false },
            { value: 'B', text: 'False cause (correlation vs causation)', correct: true },
            { value: 'C', text: 'Ad hominem attack', correct: false },
            { value: 'D', text: 'Circular reasoning', correct: false }
          ]
        }
      ]
    }
  }

  // Generate smart question sequence based on user preferences and performance
  const generateQuestionSequence = (userPreferences, previousPerformance = null) => {
    const sequence = []

    // Q1-2: Easy questions in preferred style
    const preferredStyle = userPreferences.primary
    const easyPreferred = questionBank.easy[preferredStyle] || questionBank.easy.visual
    sequence.push(easyPreferred[0])
    sequence.push(easyPreferred[1] || easyPreferred[0])

    // Q3-4: Same difficulty, but in LEAST preferred style
    const leastPreferred = getLeastPreferredStyle(userPreferences)
    const easyLeast = questionBank.easy[leastPreferred] || questionBank.easy.text
    sequence.push(easyLeast[0])
    if (easyLeast[1]) sequence.push(easyLeast[1])

    // Q5-6: Medium difficulty, mixed format
    const mediumQuestions = [
      ...Object.values(questionBank.medium).flat()
    ]
    sequence.push(mediumQuestions[0])
    sequence.push(mediumQuestions[1] || mediumQuestions[0])

    // Q7-8: Hard questions requiring concept application
    const hardQuestions = [
      ...Object.values(questionBank.hard).flat()
    ]
    sequence.push(hardQuestions[0])
    sequence.push(hardQuestions[1] || hardQuestions[0])

    return sequence.slice(0, 8) // Ensure exactly 8 questions
  }

  const getLeastPreferredStyle = (preferences) => {
    const styles = ['visual', 'auditory', 'text', 'kinesthetic']
    const preferred = preferences.primary
    const secondary = preferences.secondary

    return styles.find(style =>
      style !== preferred && style !== secondary
    ) || 'text'
  }

  return { generateQuestionSequence, questionBank }
}

// Advanced Analytics During Testing
const useTestAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    responseTimings: [],
    stressIndicators: [],
    performancePattern: [],
    difficultyAdaptation: {},
    formatPerformance: {}
  })

  const recordResponseTime = (questionId, startTime, endTime, isCorrect) => {
    const responseTime = endTime - startTime

    setAnalytics(prev => ({
      ...prev,
      responseTimings: [...prev.responseTimings, {
        questionId,
        responseTime,
        isCorrect,
        timestamp: endTime
      }]
    }))
  }

  const recordStressIndicator = (type, data) => {
    setAnalytics(prev => ({
      ...prev,
      stressIndicators: [...prev.stressIndicators, {
        type, // 'long_pause', 'multiple_changes', 'rapid_clicking'
        timestamp: Date.now(),
        data
      }]
    }))
  }

  const updatePerformancePattern = (questionIndex, isCorrect, difficulty, format) => {
    setAnalytics(prev => ({
      ...prev,
      performancePattern: [...prev.performancePattern, {
        questionIndex,
        isCorrect,
        difficulty,
        format,
        timestamp: Date.now()
      }],
      formatPerformance: {
        ...prev.formatPerformance,
        [format]: {
          total: (prev.formatPerformance[format]?.total || 0) + 1,
          correct: (prev.formatPerformance[format]?.correct || 0) + (isCorrect ? 1 : 0)
        }
      }
    }))
  }

  const calculateDifficultyProgression = () => {
    const pattern = analytics.performancePattern
    if (pattern.length < 2) return 'stable'

    const recentPerformance = pattern.slice(-3)
    const correctCount = recentPerformance.filter(p => p.isCorrect).length

    if (correctCount >= 2) return 'improving'
    if (correctCount === 0) return 'struggling'
    return 'stable'
  }

  return {
    analytics,
    recordResponseTime,
    recordStressIndicator,
    updatePerformancePattern,
    calculateDifficultyProgression
  }
}

// Main Smart Test Engine Component
const SmartTestEngine = ({ userPreferences, onTestComplete }) => {
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [answerChanges, setAnswerChanges] = useState({})
  const [testStartTime] = useState(Date.now())

  const pauseTimer = useRef(null)
  const clickCount = useRef(0)

  const { generateQuestionSequence } = SmartQuestionGenerator()
  const {
    analytics,
    recordResponseTime,
    recordStressIndicator,
    updatePerformancePattern,
    calculateDifficultyProgression
  } = useTestAnalytics()

  // Initialize test
  useEffect(() => {
    const questionSequence = generateQuestionSequence(userPreferences)
    setQuestions(questionSequence)
    setAnswers(new Array(questionSequence.length).fill(''))
    setQuestionStartTime(Date.now())
  }, [userPreferences])

  // Track long pauses (stress indicator)
  useEffect(() => {
    pauseTimer.current = setTimeout(() => {
      recordStressIndicator('long_pause', {
        questionIndex: currentQuestion,
        pauseDuration: 10000 // 10 seconds
      })
    }, 10000)

    return () => {
      if (pauseTimer.current) {
        clearTimeout(pauseTimer.current)
      }
    }
  }, [currentQuestion])

  // Enhanced answer selection with analytics
  const handleAnswerSelect = (answer) => {
    const now = Date.now()
    const previousAnswer = answers[currentQuestion]

    // Track answer changes (stress indicator)
    if (previousAnswer && previousAnswer !== answer) {
      const changes = answerChanges[currentQuestion] || 0
      setAnswerChanges(prev => ({
        ...prev,
        [currentQuestion]: changes + 1
      }))

      if (changes >= 1) {
        recordStressIndicator('multiple_changes', {
          questionIndex: currentQuestion,
          changeCount: changes + 1
        })
      }
    }

    // Track rapid clicking (stress indicator)
    clickCount.current++
    setTimeout(() => {
      clickCount.current--
    }, 1000)

    if (clickCount.current > 3) {
      recordStressIndicator('rapid_clicking', {
        questionIndex: currentQuestion,
        clicksPerSecond: clickCount.current
      })
    }

    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answer
    setAnswers(newAnswers)

    // Record response time and update analytics
    const currentQ = questions[currentQuestion]
    const isCorrect = currentQ?.options.find(opt => opt.value === answer)?.correct || false

    recordResponseTime(currentQ?.id, questionStartTime, now, isCorrect)
    updatePerformancePattern(currentQuestion, isCorrect, currentQ?.difficulty, currentQ?.format)

    // Clear pause timer since user interacted
    if (pauseTimer.current) {
      clearTimeout(pauseTimer.current)
    }
  }

  // Navigation with timing reset
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setQuestionStartTime(Date.now())
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setQuestionStartTime(Date.now())
    }
  }

  // Submit with comprehensive analytics
  const handleSubmit = () => {
    const testEndTime = Date.now()
    const totalTestTime = testEndTime - testStartTime

    const testResults = {
      answers,
      analytics,
      answerChanges,
      totalTestTime,
      questionSequence: questions.map(q => ({
        id: q.id,
        difficulty: q.difficulty,
        format: q.format,
        type: q.type
      })),
      performanceMetrics: {
        accuracy: analytics.performancePattern.filter(p => p.isCorrect).length / questions.length,
        averageResponseTime: analytics.responseTimings.reduce((sum, r) => sum + r.responseTime, 0) / analytics.responseTimings.length,
        stressLevel: analytics.stressIndicators.length,
        difficultyProgression: calculateDifficultyProgression(),
        formatPreference: Object.entries(analytics.formatPerformance).reduce((best, [format, data]) => {
          const accuracy = data.correct / data.total
          return accuracy > (best.accuracy || 0) ? { format, accuracy } : best
        }, {})
      }
    }

    onTestComplete(testResults)
  }

  // Render current question
  const renderQuestion = () => {
    const question = questions[currentQuestion]
    if (!question) return null

    return (
      <div className="smart-question">
        <div className="question-metadata">
          <span className={`difficulty-badge ${question.difficulty}`}>
            {question.difficulty.toUpperCase()}
          </span>
          <span className={`format-badge ${question.format}`}>
            {question.format.toUpperCase()}
          </span>
          <span className="type-badge">
            {question.type.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <h3 className="question-text">{question.question}</h3>

        {question.context && (
          <div
            className="question-context"
            dangerouslySetInnerHTML={{ __html: question.context }}
          />
        )}

        <div className="options-container">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`option ${answers[currentQuestion] === option.value ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(option.value)}
            >
              <div className="option-radio">
                {answers[currentQuestion] === option.value && (
                  <div className="option-dot"></div>
                )}
              </div>
              <span className="option-text">{option.text}</span>
            </div>
          ))}
        </div>

        {/* Real-time analytics display (for demo purposes) */}
        <div className="analytics-preview">
          <div className="analytics-item">
            <span>Response Time:</span>
            <span>{((Date.now() - questionStartTime) / 1000).toFixed(1)}s</span>
          </div>
          <div className="analytics-item">
            <span>Changes:</span>
            <span>{answerChanges[currentQuestion] || 0}</span>
          </div>
          <div className="analytics-item">
            <span>Pattern:</span>
            <span>{calculateDifficultyProgression()}</span>
          </div>
        </div>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="smart-test-loading">
        <div className="loading-spinner"></div>
        <p>Generating personalized test sequence...</p>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="smart-test-engine">
      <div className="test-header">
        <h2>🎯 Smart Caliber Test</h2>
        <p>Adaptive assessment with behavioral analysis</p>

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

      {renderQuestion()}

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
            Next Question
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="nav-button primary"
            disabled={!answers[currentQuestion]}
          >
            Complete Assessment
          </button>
        )}
      </div>
    </div>
  )
}

export default SmartTestEngine