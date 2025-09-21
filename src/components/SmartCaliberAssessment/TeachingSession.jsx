import { useState, useEffect, useRef } from 'react'
import './TeachingSession.css'

// Multi-Format Content Component
const MultiFormatContent = ({ concept, format, onInteraction }) => {
  const [interactionData, setInteractionData] = useState({
    viewTime: 0,
    interactions: [],
    completed: false
  })

  const startTime = useRef(Date.now())
  const interactionTimer = useRef(null)

  useEffect(() => {
    interactionTimer.current = setInterval(() => {
      setInteractionData(prev => ({
        ...prev,
        viewTime: Date.now() - startTime.current
      }))
    }, 1000)

    return () => {
      if (interactionTimer.current) {
        clearInterval(interactionTimer.current)
      }
    }
  }, [])

  const recordInteraction = (type, data = {}) => {
    const interaction = {
      type,
      timestamp: Date.now(),
      data,
      timeFromStart: Date.now() - startTime.current
    }

    setInteractionData(prev => ({
      ...prev,
      interactions: [...prev.interactions, interaction]
    }))

    onInteraction?.(format, interaction)
  }

  const renderVisualContent = () => (
    <div className="visual-content">
      <h3>📊 Visual Learning: {concept.title}</h3>

      <div className="visual-elements">
        {/* Interactive Diagram */}
        <div className="interactive-diagram">
          <svg viewBox="0 0 400 300" className="concept-diagram">
            {/* Example: Math concept visualization */}
            {concept.visualElements?.map((element, index) => (
              <g key={index}>
                {element.type === 'circle' && (
                  <circle
                    cx={element.x}
                    cy={element.y}
                    r={element.r}
                    fill={element.color}
                    stroke="#667eea"
                    strokeWidth="2"
                    onClick={() => recordInteraction('visual_element_click', { element: index })}
                    style={{ cursor: 'pointer' }}
                  />
                )}
                {element.type === 'rect' && (
                  <rect
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    fill={element.color}
                    stroke="#667eea"
                    strokeWidth="2"
                    onClick={() => recordInteraction('visual_element_click', { element: index })}
                    style={{ cursor: 'pointer' }}
                  />
                )}
                {element.label && (
                  <text
                    x={element.x + (element.width || element.r || 0)}
                    y={element.y + 20}
                    fill="#2d3748"
                    fontSize="12"
                    textAnchor="middle"
                  >
                    {element.label}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Visual Steps */}
        <div className="visual-steps">
          {concept.steps?.map((step, index) => (
            <div
              key={index}
              className="visual-step"
              onClick={() => recordInteraction('step_click', { step: index })}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-content">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
                {step.image && (
                  <div className="step-image">
                    <div className="placeholder-image">
                      📊 {step.image}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Elements */}
        <div className="interactive-elements">
          <button
            className="interaction-btn"
            onClick={() => recordInteraction('visual_completed')}
          >
            ✓ I understand the visual representation
          </button>
        </div>
      </div>
    </div>
  )

  const renderAuditoryContent = () => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentSegment, setCurrentSegment] = useState(0)

    const playAudio = (segmentIndex = 0) => {
      recordInteraction('audio_play', { segment: segmentIndex })

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()

        const text = concept.audioSegments?.[segmentIndex]?.text || concept.description
        const utterance = new SpeechSynthesisUtterance(text)

        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 1.0

        utterance.onstart = () => setIsPlaying(true)
        utterance.onend = () => {
          setIsPlaying(false)
          recordInteraction('audio_complete', { segment: segmentIndex })
        }

        window.speechSynthesis.speak(utterance)
      }
    }

    return (
      <div className="auditory-content">
        <h3>🎧 Audio Learning: {concept.title}</h3>

        <div className="audio-controls">
          <button
            className="audio-btn primary"
            onClick={() => playAudio(currentSegment)}
            disabled={isPlaying}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play Explanation'}
          </button>
        </div>

        <div className="audio-segments">
          {concept.audioSegments?.map((segment, index) => (
            <div
              key={index}
              className={`audio-segment ${currentSegment === index ? 'active' : ''}`}
            >
              <button
                className="segment-btn"
                onClick={() => {
                  setCurrentSegment(index)
                  playAudio(index)
                }}
              >
                🔊 {segment.title}
              </button>
              <p className="segment-transcript">{segment.text}</p>
            </div>
          ))}
        </div>

        <div className="audio-comprehension">
          <h4>🎯 Key Points to Listen For:</h4>
          <ul>
            {concept.keyPoints?.map((point, index) => (
              <li
                key={index}
                onClick={() => recordInteraction('key_point_focus', { point: index })}
              >
                {point}
              </li>
            ))}
          </ul>
        </div>

        <button
          className="interaction-btn"
          onClick={() => recordInteraction('audio_completed')}
        >
          ✓ I understand the audio explanation
        </button>
      </div>
    )
  }

  const renderTextContent = () => {
    const [highlightedSections, setHighlightedSections] = useState(new Set())

    const highlightSection = (sectionIndex) => {
      setHighlightedSections(prev => new Set([...prev, sectionIndex]))
      recordInteraction('text_highlight', { section: sectionIndex })
    }

    return (
      <div className="text-content">
        <h3>📖 Reading Material: {concept.title}</h3>

        <div className="text-sections">
          {concept.textSections?.map((section, index) => (
            <div
              key={index}
              className={`text-section ${highlightedSections.has(index) ? 'highlighted' : ''}`}
              onClick={() => highlightSection(index)}
            >
              <h4>{section.heading}</h4>
              <p>{section.content}</p>
              {section.example && (
                <div className="text-example">
                  <strong>Example:</strong> {section.example}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-summary">
          <h4>📝 Summary:</h4>
          <p>{concept.summary}</p>
        </div>

        <div className="text-notes">
          <h4>✍️ Take Notes:</h4>
          <textarea
            className="notes-area"
            placeholder="Write your notes here..."
            onChange={(e) => recordInteraction('note_taking', {
              text: e.target.value,
              length: e.target.value.length
            })}
          />
        </div>

        <button
          className="interaction-btn"
          onClick={() => recordInteraction('text_completed')}
        >
          ✓ I've read and understood the material
        </button>
      </div>
    )
  }

  const renderKinestheticContent = () => {
    const [currentStep, setCurrentStep] = useState(0)
    const [completedSteps, setCompletedSteps] = useState(new Set())

    const completeStep = (stepIndex) => {
      setCompletedSteps(prev => new Set([...prev, stepIndex]))
      recordInteraction('kinesthetic_step_complete', { step: stepIndex })

      if (stepIndex < concept.interactiveSteps?.length - 1) {
        setCurrentStep(stepIndex + 1)
      }
    }

    return (
      <div className="kinesthetic-content">
        <h3>🤲 Hands-on Learning: {concept.title}</h3>

        <div className="interactive-steps">
          {concept.interactiveSteps?.map((step, index) => (
            <div
              key={index}
              className={`interactive-step ${currentStep === index ? 'active' : ''} ${
                completedSteps.has(index) ? 'completed' : ''
              }`}
            >
              <div className="step-header">
                <span className="step-number">{index + 1}</span>
                <h4>{step.title}</h4>
                {completedSteps.has(index) && <span className="check-mark">✓</span>}
              </div>

              <p className="step-instruction">{step.instruction}</p>

              {step.interactive && (
                <div className="step-interactive">
                  {step.interactive.type === 'slider' && (
                    <div className="slider-control">
                      <label>{step.interactive.label}</label>
                      <input
                        type="range"
                        min={step.interactive.min}
                        max={step.interactive.max}
                        defaultValue={step.interactive.default}
                        onChange={(e) => recordInteraction('slider_change', {
                          step: index,
                          value: e.target.value
                        })}
                      />
                    </div>
                  )}

                  {step.interactive.type === 'calculator' && (
                    <div className="calculator-control">
                      <input
                        type="number"
                        placeholder="Enter value"
                        onChange={(e) => recordInteraction('calculator_input', {
                          step: index,
                          value: e.target.value
                        })}
                      />
                      <button onClick={() => recordInteraction('calculator_compute', { step: index })}>
                        Calculate
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                className="step-complete-btn"
                onClick={() => completeStep(index)}
                disabled={index !== currentStep}
              >
                Complete Step {index + 1}
              </button>
            </div>
          ))}
        </div>

        <button
          className="interaction-btn"
          onClick={() => recordInteraction('kinesthetic_completed')}
          disabled={completedSteps.size < concept.interactiveSteps?.length}
        >
          ✓ I've completed all hands-on activities
        </button>
      </div>
    )
  }

  // Render based on format
  switch (format) {
    case 'visual':
      return renderVisualContent()
    case 'auditory':
      return renderAuditoryContent()
    case 'text':
      return renderTextContent()
    case 'kinesthetic':
      return renderKinestheticContent()
    default:
      return renderVisualContent()
  }
}

// Comprehension Checkpoint Component
const ComprehensionCheckpoint = ({ concept, onComplete }) => {
  const [answers, setAnswers] = useState({})
  const [confidence, setConfidence] = useState({})
  const [startTime] = useState(Date.now())

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleConfidenceChange = (questionId, level) => {
    setConfidence(prev => ({ ...prev, [questionId]: level }))
  }

  const handleSubmit = () => {
    const completionData = {
      answers,
      confidence,
      timeSpent: Date.now() - startTime,
      concept: concept.id
    }

    onComplete(completionData)
  }

  return (
    <div className="comprehension-checkpoint">
      <h3>🎯 Quick Comprehension Check</h3>
      <p>Let's verify your understanding of {concept.title}</p>

      <div className="checkpoint-questions">
        {concept.checkpointQuestions?.map((question, index) => (
          <div key={index} className="checkpoint-question">
            <h4>{question.question}</h4>

            <div className="question-options">
              {question.options.map((option, optIndex) => (
                <label key={optIndex} className="option-label">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option.value}
                    onChange={() => handleAnswerChange(index, option.value)}
                  />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>

            <div className="confidence-rating">
              <p>How confident are you?</p>
              {['Low', 'Medium', 'High', 'Very High'].map((level, levelIndex) => (
                <button
                  key={levelIndex}
                  className={`confidence-btn ${confidence[index] === levelIndex + 1 ? 'selected' : ''}`}
                  onClick={() => handleConfidenceChange(index, levelIndex + 1)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="explanation-section">
        <h4>💭 Explain in your own words:</h4>
        <textarea
          placeholder="Describe what you learned in your own words..."
          onChange={(e) => setAnswers(prev => ({
            ...prev,
            explanation: e.target.value
          }))}
        />
      </div>

      <button
        className="checkpoint-submit"
        onClick={handleSubmit}
        disabled={Object.keys(answers).length < concept.checkpointQuestions?.length}
      >
        Complete Checkpoint
      </button>
    </div>
  )
}

// Main Teaching Session Component
const TeachingSession = ({ concepts, userPreferences, onSessionComplete }) => {
  const [currentConcept, setCurrentConcept] = useState(0)
  const [currentFormat, setCurrentFormat] = useState(userPreferences?.primary || 'visual')
  const [sessionData, setSessionData] = useState({
    interactions: [],
    formatPerformance: {},
    comprehensionScores: [],
    timeSpent: {}
  })

  const handleFormatInteraction = (format, interaction) => {
    setSessionData(prev => ({
      ...prev,
      interactions: [...prev.interactions, { format, ...interaction }]
    }))
  }

  const handleComprehensionComplete = (checkpointData) => {
    setSessionData(prev => ({
      ...prev,
      comprehensionScores: [...prev.comprehensionScores, checkpointData]
    }))

    if (currentConcept < concepts.length - 1) {
      setCurrentConcept(currentConcept + 1)
      setCurrentFormat(userPreferences?.primary || 'visual')
    } else {
      onSessionComplete(sessionData)
    }
  }

  const switchFormat = (newFormat) => {
    setCurrentFormat(newFormat)
    setSessionData(prev => ({
      ...prev,
      interactions: [...prev.interactions, {
        type: 'format_switch',
        from: currentFormat,
        to: newFormat,
        timestamp: Date.now(),
        conceptIndex: currentConcept
      }]
    }))
  }

  const currentConceptData = concepts[currentConcept]

  return (
    <div className="teaching-session">
      <div className="session-header">
        <h2>📚 Teaching Session</h2>
        <div className="progress-indicator">
          Concept {currentConcept + 1} of {concepts.length}
        </div>
      </div>

      <div className="format-selector">
        <h3>Choose your learning format:</h3>
        <div className="format-buttons">
          {['visual', 'auditory', 'text', 'kinesthetic'].map(format => (
            <button
              key={format}
              className={`format-btn ${currentFormat === format ? 'active' : ''}`}
              onClick={() => switchFormat(format)}
            >
              {format === 'visual' && '👁️ Visual'}
              {format === 'auditory' && '🎧 Audio'}
              {format === 'text' && '📖 Reading'}
              {format === 'kinesthetic' && '🤲 Hands-on'}
            </button>
          ))}
        </div>
      </div>

      <div className="content-area">
        <MultiFormatContent
          concept={currentConceptData}
          format={currentFormat}
          onInteraction={handleFormatInteraction}
        />
      </div>

      <div className="checkpoint-area">
        <ComprehensionCheckpoint
          concept={currentConceptData}
          onComplete={handleComprehensionComplete}
        />
      </div>
    </div>
  )
}

export default TeachingSession