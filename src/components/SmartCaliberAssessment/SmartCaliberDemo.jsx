import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import SmartCaliberAssessment from './SmartCaliberAssessment'
import TeachingSession from './TeachingSession'
import SmartTestEngine from './SmartTestEngine'
import VisualProfile from './VisualProfile'
import AIAnalysisEngine from './AIAnalysisEngine'
import './SmartCaliberDemo.css'

// Mock concepts for teaching session
const mockConcepts = [
  {
    id: 'pattern_recognition',
    title: 'Pattern Recognition Fundamentals',
    visualElements: [
      { type: 'circle', x: 100, y: 100, r: 30, color: '#667eea', label: 'Input' },
      { type: 'rect', x: 200, y: 80, width: 60, height: 40, color: '#38b2ac', label: 'Process' },
      { type: 'circle', x: 320, y: 100, r: 30, color: '#48bb78', label: 'Output' }
    ],
    steps: [
      {
        title: 'Identify Patterns',
        description: 'Look for recurring elements or sequences in the data',
        image: 'Pattern visualization diagram'
      },
      {
        title: 'Analyze Relationships',
        description: 'Understand how different elements connect and interact',
        image: 'Relationship mapping'
      },
      {
        title: 'Predict Outcomes',
        description: 'Use identified patterns to predict future occurrences',
        image: 'Prediction model'
      }
    ],
    audioSegments: [
      {
        title: 'Introduction to Patterns',
        text: 'Patterns are repeating sequences or structures that we can observe and analyze. They form the foundation of learning and prediction in many fields.'
      },
      {
        title: 'Recognition Techniques',
        text: 'To recognize patterns effectively, we need to train our minds to see similarities, differences, and underlying structures in information.'
      }
    ],
    keyPoints: [
      'Patterns exist in all forms of data and information',
      'Recognition improves with practice and exposure',
      'Understanding patterns leads to better prediction abilities'
    ],
    textSections: [
      {
        heading: 'What are Patterns?',
        content: 'Patterns are regularities or recurring themes that can be observed in data, behavior, or natural phenomena. They represent underlying structures that help us make sense of complex information.',
        example: 'The Fibonacci sequence (1, 1, 2, 3, 5, 8...) where each number is the sum of the two preceding ones.'
      },
      {
        heading: 'Why Pattern Recognition Matters',
        content: 'Pattern recognition is fundamental to learning, problem-solving, and decision-making. It allows us to categorize information, make predictions, and understand relationships.',
        example: 'Recognizing that traffic is usually heavy at 8 AM helps you plan your commute.'
      }
    ],
    summary: 'Pattern recognition is the cognitive ability to identify regularities and structures in information, enabling prediction and understanding.',
    interactiveSteps: [
      {
        title: 'Observe the Sequence',
        instruction: 'Look at this number sequence: 2, 4, 8, 16, ?. What comes next?',
        interactive: {
          type: 'calculator',
          label: 'Enter the next number'
        }
      },
      {
        title: 'Identify the Rule',
        instruction: 'Each number is double the previous one. This is a geometric sequence.',
        interactive: {
          type: 'slider',
          label: 'Multiplier',
          min: 1,
          max: 5,
          default: 2
        }
      }
    ],
    checkpointQuestions: [
      {
        question: 'What is the main purpose of pattern recognition?',
        options: [
          { value: 'memorization', text: 'To memorize information' },
          { value: 'prediction', text: 'To make predictions and understand relationships' },
          { value: 'calculation', text: 'To perform mathematical calculations' },
          { value: 'classification', text: 'To classify objects only' }
        ]
      },
      {
        question: 'Which of these is an example of a pattern?',
        options: [
          { value: 'random', text: 'Random numbers' },
          { value: 'fibonacci', text: 'Fibonacci sequence' },
          { value: 'single', text: 'A single data point' },
          { value: 'noise', text: 'Background noise' }
        ]
      }
    ]
  }
]

const SmartCaliberDemo = () => {
  const [currentPhase, setCurrentPhase] = useState('introduction') // 'introduction', 'preferences', 'teaching', 'testing', 'results'
  const [userPreferences, setUserPreferences] = useState(null)
  const [sessionData, setSessionData] = useState(null)
  const [testResults, setTestResults] = useState(null)
  const [finalProfile, setFinalProfile] = useState(null)

  const { user } = useAuth()
  const navigate = useNavigate()

  // Handle preference selection
  const handlePreferenceSelection = (preferences) => {
    setUserPreferences(preferences)
    setCurrentPhase('teaching')
  }

  // Handle teaching session completion
  const handleTeachingComplete = (teachingData) => {
    setSessionData(teachingData)
    setCurrentPhase('testing')
  }

  // Handle test completion
  const handleTestComplete = (results) => {
    setTestResults(results)

    // Generate final caliber profile using AI Analysis Engine
    const engine = new AIAnalysisEngine()
    const profile = engine.analyzeCaliberProfile(results, sessionData, userPreferences)
    setFinalProfile(profile)

    setCurrentPhase('results')
  }

  // Handle completion and navigation
  const handleComplete = () => {
    // Save profile to user context or database
    if (finalProfile) {
      // updateUser({ caliberProfile: finalProfile })
    }
    navigate('/dashboard')
  }

  const renderIntroduction = () => (
    <div className="demo-introduction">
      <div className="intro-container">
        <div className="intro-header">
          <h1>🎯 Smart Caliber Assessment</h1>
          <p className="intro-subtitle">
            Revolutionary AI-powered learning analysis that goes beyond traditional assessments
          </p>
        </div>

        <div className="intro-features">
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>Behavioral Analysis</h3>
              <p>Advanced tracking of mouse movements, response times, and interaction patterns</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Multi-Format Testing</h3>
              <p>Adaptive questions that change based on your performance and learning style</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Visual Analytics</h3>
              <p>Comprehensive radar charts and performance visualizations</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Classification</h3>
              <p>Six distinct learning caliber types with personalized recommendations</p>
            </div>
          </div>
        </div>

        <div className="intro-process">
          <h3>The Assessment Process</h3>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Learning Style Declaration</h4>
                <p>Tell us your preferred learning approach</p>
              </div>
            </div>

            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Interactive Teaching Session</h4>
                <p>Experience multi-format content delivery</p>
              </div>
            </div>

            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Smart 8-Question Test</h4>
                <p>Adaptive questions with behavioral tracking</p>
              </div>
            </div>

            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Comprehensive Analysis</h4>
                <p>AI-powered insights and recommendations</p>
              </div>
            </div>
          </div>
        </div>

        <div className="intro-caliber-types">
          <h3>Discover Your Learning Caliber</h3>
          <div className="caliber-preview">
            <div className="caliber-type-card">
              <h4>⚡ Rapid Processor</h4>
              <p>Processes information quickly with high accuracy under pressure</p>
            </div>
            <div className="caliber-type-card">
              <h4>🧠 Deep Thinker</h4>
              <p>Takes time to process but delivers highly accurate responses</p>
            </div>
            <div className="caliber-type-card">
              <h4>🔄 Adaptive Learner</h4>
              <p>Adjusts approach based on task difficulty and format</p>
            </div>
            <div className="caliber-type-card">
              <h4>🎯 Pattern Specialist</h4>
              <p>Excels at recognizing patterns and applying concepts</p>
            </div>
            <div className="caliber-type-card">
              <h4>🌟 Versatile Performer</h4>
              <p>Balanced performance across different formats</p>
            </div>
            <div className="caliber-type-card">
              <h4>📈 Growth Mindset</h4>
              <p>Shows clear improvement and learns from mistakes</p>
            </div>
          </div>
        </div>

        <div className="intro-actions">
          <button
            className="start-assessment-btn"
            onClick={() => setCurrentPhase('preferences')}
          >
            Start Smart Assessment
          </button>
          <p className="assessment-time">⏱️ Estimated time: 15-20 minutes</p>
        </div>
      </div>
    </div>
  )

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 'introduction':
        return renderIntroduction()

      case 'preferences':
        return (
          <SmartCaliberAssessment
            onPreferenceSelection={handlePreferenceSelection}
          />
        )

      case 'teaching':
        return (
          <TeachingSession
            concepts={mockConcepts}
            userPreferences={userPreferences}
            onSessionComplete={handleTeachingComplete}
          />
        )

      case 'testing':
        return (
          <SmartTestEngine
            userPreferences={userPreferences}
            onTestComplete={handleTestComplete}
          />
        )

      case 'results':
        return (
          <div className="results-wrapper">
            <VisualProfile
              testResults={testResults}
              sessionData={sessionData}
              userPreferences={userPreferences}
            />
            <div className="results-actions">
              <button
                className="complete-btn"
                onClick={handleComplete}
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        )

      default:
        return renderIntroduction()
    }
  }

  return (
    <div className="smart-caliber-demo">
      {/* Progress Indicator */}
      {currentPhase !== 'introduction' && (
        <div className="demo-progress">
          <div className="progress-steps">
            <div className={`progress-step ${currentPhase === 'preferences' ? 'active' : currentPhase !== 'introduction' ? 'completed' : ''}`}>
              <span>1</span>
              <label>Preferences</label>
            </div>
            <div className={`progress-step ${currentPhase === 'teaching' ? 'active' : ['testing', 'results'].includes(currentPhase) ? 'completed' : ''}`}>
              <span>2</span>
              <label>Teaching</label>
            </div>
            <div className={`progress-step ${currentPhase === 'testing' ? 'active' : currentPhase === 'results' ? 'completed' : ''}`}>
              <span>3</span>
              <label>Testing</label>
            </div>
            <div className={`progress-step ${currentPhase === 'results' ? 'active' : ''}`}>
              <span>4</span>
              <label>Results</label>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="demo-content">
        {renderCurrentPhase()}
      </div>
    </div>
  )
}

export default SmartCaliberDemo