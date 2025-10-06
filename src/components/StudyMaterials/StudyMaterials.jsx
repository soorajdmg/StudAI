import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  analyzeDocument,
  generateStudyPlanFromDocument,
  generateAITutorResponse,
  generateQuizFromDocument,
  generatePersonalizedStudyMaterial,
  PREDEFINED_TOPICS
} from '../../services/GeminiService'
import './StudyMaterials.css'

const StudyMaterials = () => {
  const { user } = useAuth()

  // Main tab state
  const [activeMainTab, setActiveMainTab] = useState('generate') // 'generate' or 'upload'

  // Study Material Generation state
  const [selectedCategory, setSelectedCategory] = useState('science')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [materialType, setMaterialType] = useState('summary')
  const [generatedMaterial, setGeneratedMaterial] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [useCustomTopic, setUseCustomTopic] = useState(false)

  // Document Upload state
  const [documents, setDocuments] = useState([])
  const [currentDocument, setCurrentDocument] = useState(null)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [activeFeature, setActiveFeature] = useState(null) // 'tutor', 'quiz', 'planner'

  // Tutor Chat state
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')

  // Quiz state
  const [quizData, setQuizData] = useState(null)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)

  // Study Planner state
  const [studyPlan, setStudyPlan] = useState(null)

  const fileInputRef = useRef(null)
  const chatEndRef = useRef(null)

  // Get user's learning style
  const userLearningStyle = user?.learningProfile || 'Mixed'

  // Initialize chat with welcome message
  useEffect(() => {
    setChatMessages([
      {
        type: 'ai',
        content: `Hello ${user?.name || 'there'}! I'm your AI Study Assistant. Upload a document and I'll help you understand it better!`,
        timestamp: new Date()
      }
    ])
  }, [user?.name])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Generate Study Material
  const handleGenerateMaterial = async (e) => {
    e.preventDefault()

    const topic = useCustomTopic ? customTopic :
      PREDEFINED_TOPICS[selectedCategory]?.find(t => t.id === selectedTopic)?.name

    if (!topic) {
      alert('Please select a topic or enter a custom topic')
      return
    }

    setIsGenerating(true)
    try {
      const material = await generatePersonalizedStudyMaterial(
        topic,
        materialType,
        userLearningStyle
      )

      setGeneratedMaterial(material)
    } catch (error) {
      console.error('Error generating material:', error)
      alert('Failed to generate material. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Export material to PDF/TXT
  const handleDownload = () => {
    if (!generatedMaterial) return

    const content = `${generatedMaterial.topic}\n\nMaterial Type: ${generatedMaterial.materialType}\nLearning Style: ${generatedMaterial.learningStyle}\n\n${generatedMaterial.content}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generatedMaterial.topic.replace(/\s+/g, '_')}_${generatedMaterial.materialType}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Text-to-Speech (Browser API)
  const handleTextToSpeech = () => {
    if (!generatedMaterial) return

    const utterance = new SpeechSynthesisUtterance(generatedMaterial.content)
    utterance.rate = 0.9
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  }

  // File Upload Handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const newDocument = {
      id: Date.now(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date(),
      content: null,
      processed: false
    }

    // Read file content
    const reader = new FileReader()
    reader.onload = (e) => {
      newDocument.content = e.target.result
      setDocuments(prev => [...prev, newDocument])
      setCurrentDocument(newDocument)
      analyzeDocumentContent(newDocument)
    }
    reader.readAsText(file)
  }

  // Analyze Document
  const analyzeDocumentContent = async (document) => {
    if (!document) return

    setAiLoading(true)
    try {
      console.log('🔍 Starting document analysis with AI...')
      const analysis = await analyzeDocument(
        document.content,
        document.name,
        userLearningStyle
      )

      console.log('✅ Analysis complete:', analysis)
      setAiAnalysis(analysis)
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === document.id
            ? { ...doc, processed: true, analysis }
            : doc
        )
      )
    } catch (error) {
      console.error('Error analyzing document:', error)
    } finally {
      setAiLoading(false)
    }
  }

  // Tutor Chat
  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = {
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    const messageToProcess = chatInput
    setChatInput('')

    try {
      console.log('🤖 Getting AI tutor response...')
      const aiResponseText = await generateAITutorResponse(
        messageToProcess,
        currentDocument?.analysis,
        user
      )

      const aiResponse = {
        type: 'ai',
        content: aiResponseText,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error getting AI response:', error)
      const fallbackResponse = {
        type: 'ai',
        content: "I'm having trouble connecting right now. Please try again!",
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, fallbackResponse])
    }
  }

  // Generate Quiz
  const generateQuizAI = async () => {
    if (!currentDocument) return

    setIsGeneratingQuiz(true)
    try {
      console.log('🎯 Generating AI quiz...')
      const quiz = await generateQuizFromDocument(
        currentDocument.content,
        currentDocument.name,
        userLearningStyle
      )

      console.log('✅ Quiz generated:', quiz)
      setQuizData(quiz)
    } catch (error) {
      console.error('Error generating quiz:', error)
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  // Generate Study Plan
  const generateStudyPlanAI = async () => {
    if (!currentDocument?.analysis) return

    setAiLoading(true)
    try {
      console.log('📅 Generating AI study plan...')
      const plan = await generateStudyPlanFromDocument(
        currentDocument.analysis,
        userLearningStyle,
        '2 weeks'
      )

      console.log('✅ Study plan generated:', plan)
      setStudyPlan(plan)
    } catch (error) {
      console.error('Error generating study plan:', error)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="study-materials-container">
      <div className="study-materials-header">
        <h2>AI Study Materials</h2>
        <p>Generate personalized study materials or analyze your documents - tailored to your {userLearningStyle} learning style</p>
      </div>

      {/* Main Navigation Tabs */}
      <div className="main-tabs-container">
        <div className="main-tabs">
          <button
            className={`main-tab ${activeMainTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('generate')}
          >
            <span className="tab-icon">✨</span>
            <div className="tab-text">
              <span className="tab-title">Generate Materials</span>
              <span className="tab-subtitle">Create AI study content</span>
            </div>
          </button>
          <button
            className={`main-tab ${activeMainTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveMainTab('upload')}
          >
            <span className="tab-icon">📚</span>
            <div className="tab-text">
              <span className="tab-title">Upload & Analyze</span>
              <span className="tab-subtitle">Document learning tools</span>
            </div>
          </button>
        </div>
      </div>

      <div className="study-materials-content">
        {/* Tab 1: Material Generation */}
        {activeMainTab === 'generate' && (
          <div className="tab-section animate-in">
            <div className="section-intro">
              <h3>AI-Powered Study Material Generation</h3>
              <p>Select a topic and get personalized study materials optimized for {userLearningStyle} learners</p>
            </div>

            <div className="material-generator">
              {/* Topic Selection */}
              <div className="topic-selector">
                <div className="selector-tabs">
                  <button
                    className={`selector-tab ${!useCustomTopic ? 'active' : ''}`}
                    onClick={() => setUseCustomTopic(false)}
                  >
                    Choose Topic
                  </button>
                  <button
                    className={`selector-tab ${useCustomTopic ? 'active' : ''}`}
                    onClick={() => setUseCustomTopic(true)}
                  >
                    Custom Topic
                  </button>
                </div>

                {!useCustomTopic ? (
                  <div className="predefined-topics">
                    <div className="category-selector">
                      {Object.keys(PREDEFINED_TOPICS).map(category => (
                        <button
                          key={category}
                          className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedCategory(category)
                            setSelectedTopic('')
                          }}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                      ))}
                    </div>

                    <div className="study-topics-grid">
                      {PREDEFINED_TOPICS[selectedCategory]?.map(topic => (
                        <div
                          key={topic.id}
                          className={`topic-list ${selectedTopic === topic.id ? 'selected' : ''}`}
                          onClick={() => setSelectedTopic(topic.id)}
                        >
                          <div className="topic-name">{topic.name}</div>
                          <div className="topic-subject">{topic.subject}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="custom-topic-input">
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="Enter any topic (e.g., Climate Change, Quantum Physics, Shakespeare)"
                      className="custom-input"
                    />
                  </div>
                )}
              </div>

              {/* Material Type & Generate */}
              <form onSubmit={handleGenerateMaterial} className="generator-form">
                <div className="form-row">
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    className="type-select"
                  >
                    <option value="summary">Summary</option>
                    <option value="notes">Study Notes</option>
                    <option value="flashcards">Flashcards</option>
                    <option value="outline">Topic Outline</option>
                  </select>
                  <button
                    type="submit"
                    className="generate-button"
                    disabled={isGenerating || (!selectedTopic && !customTopic)}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Material'}
                  </button>
                </div>
              </form>

              {/* Generated Material Display */}
              {generatedMaterial && (
                <div className="generated-material">
                  <div className="material-header">
                    <div>
                      <h4>{generatedMaterial.topic}</h4>
                      <div className="material-meta">
                        <span className="material-type-badge">{generatedMaterial.materialType}</span>
                        <span className="learning-style-badge">{generatedMaterial.learningStyle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="material-content">
                    <div className="content-text">{generatedMaterial.content}</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="material-actions">
                    {generatedMaterial.actions.map((action, index) => (
                      <button
                        key={index}
                        className="action-button"
                        onClick={() => {
                          if (action.includes('Download') || action.includes('PDF') || action.includes('Save')) {
                            handleDownload()
                          } else if (action.includes('Listen') || action.includes('TTS') || action.includes('Audio')) {
                            handleTextToSpeech()
                          } else if (action.includes('Try') || action.includes('Practice')) {
                            alert('Interactive activities coming soon!')
                          }
                        }}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Document Upload & Analysis */}
        {activeMainTab === 'upload' && (
          <div className="tab-section animate-in">
            <div className="section-intro">
              <h3>Document Analysis & Learning Tools</h3>
              <p>Upload your study documents to unlock AI-powered learning features</p>
            </div>

            {/* Upload Area */}
            <div className="upload-area">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.pdf,.doc,.docx"
                style={{ display: 'none' }}
              />

              {documents.length === 0 ? (
                <div className="upload-prompt">
                  <div className="upload-icon">📄</div>
                  <h4>Upload Your First Document</h4>
                  <p>Upload study documents to get instant AI analysis and access learning tools</p>
                  <button
                    className="upload-button-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </button>
                  <span className="upload-note">Supports TXT, PDF, DOC, and DOCX files</span>
                </div>
              ) : (
                <div className="documents-section">
                  <div className="documents-list">
                    {documents.map(doc => (
                      <div
                        key={doc.id}
                        className={`document-item ${currentDocument?.id === doc.id ? 'active' : ''}`}
                        onClick={() => setCurrentDocument(doc)}
                      >
                        <div className="doc-icon">📄</div>
                        <div className="doc-info">
                          <h5>{doc.name}</h5>
                          <span className="doc-meta">
                            {(doc.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        {doc.processed && <span className="processed-badge">✓</span>}
                      </div>
                    ))}
                  </div>
                  <button
                    className="upload-button-secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    + Add Document
                  </button>
                </div>
              )}
            </div>

            {/* Document Analysis Results */}
            {aiAnalysis && currentDocument && (
              <div className="analysis-section">
                <h4>Document Analysis</h4>
                <div className="analysis-grid">
                  <div className="analysis-card">
                    <h5>Summary</h5>
                    <p>{aiAnalysis.summary}</p>
                  </div>
                  <div className="analysis-card">
                    <h5>Key Topics</h5>
                    <div className="topics-list">
                      {aiAnalysis.keyTopics.map((topic, index) => (
                        <span key={index} className="topic-tag">{topic}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feature Buttons - Only show if document is uploaded */}
            {currentDocument && (
              <div className="features-section">
                <h4>Learning Tools</h4>
                <div className="feature-cards">
                  <div
                    className={`feature-card ${activeFeature === 'tutor' ? 'active' : ''}`}
                    onClick={() => setActiveFeature(activeFeature === 'tutor' ? null : 'tutor')}
                  >
                    <div className="feature-icon">💬</div>
                    <h5>AI Tutor Chat</h5>
                    <p>Ask questions about your document</p>
                  </div>

                  <div
                    className={`feature-card ${activeFeature === 'quiz' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveFeature(activeFeature === 'quiz' ? null : 'quiz')
                      if (activeFeature !== 'quiz' && !quizData) {
                        generateQuizAI()
                      }
                    }}
                  >
                    <div className="feature-icon">📝</div>
                    <h5>Smart Quizzes</h5>
                    <p>Test your knowledge</p>
                  </div>

                  <div
                    className={`feature-card ${activeFeature === 'planner' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveFeature(activeFeature === 'planner' ? null : 'planner')
                      if (activeFeature !== 'planner' && !studyPlan) {
                        generateStudyPlanAI()
                      }
                    }}
                  >
                    <div className="feature-icon">📅</div>
                    <h5>Study Planner</h5>
                    <p>Create personalized schedule</p>
                  </div>
                </div>

                {/* Feature Content */}
                {activeFeature === 'tutor' && (
                  <div className="feature-content">
                    <div className="chat-container">
                      <div className="chat-messages">
                        {chatMessages.map((message, index) => (
                          <div key={index} className={`message ${message.type}`}>
                            <div className="message-avatar">
                              {message.type === 'ai' ? '🤖' : '👤'}
                            </div>
                            <div className="message-content">
                              <p>{message.content}</p>
                              <span className="message-time">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                      <form className="chat-input-form" onSubmit={handleChatSubmit}>
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask me anything about your document..."
                          className="chat-input"
                        />
                        <button type="submit" className="chat-send-button">
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {activeFeature === 'quiz' && (
                  <div className="feature-content">
                    {isGeneratingQuiz ? (
                      <div className="loading-state">Generating quiz...</div>
                    ) : quizData ? (
                      <div className="quiz-content">
                        <div className="quiz-header">
                          <h4>{quizData.title}</h4>
                          <button
                            className="new-quiz-button"
                            onClick={generateQuizAI}
                          >
                            Generate New Quiz
                          </button>
                        </div>
                        <div className="quiz-questions">
                          {quizData.questions.map((question, index) => (
                            <div key={question.id} className="quiz-question">
                              <h5>Question {index + 1}</h5>
                              <p>{question.question}</p>
                              {question.type === 'multiple-choice' && (
                                <div className="quiz-options">
                                  {question.options.map((option, optIndex) => (
                                    <label key={optIndex} className="quiz-option">
                                      <input type="radio" name={`q${question.id}`} />
                                      {option}
                                    </label>
                                  ))}
                                </div>
                              )}
                              {question.type === 'true-false' && (
                                <div className="quiz-options">
                                  <label className="quiz-option">
                                    <input type="radio" name={`q${question.id}`} />
                                    True
                                  </label>
                                  <label className="quiz-option">
                                    <input type="radio" name={`q${question.id}`} />
                                    False
                                  </label>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="loading-state">Failed to generate quiz. Try again.</div>
                    )}
                  </div>
                )}

                {activeFeature === 'planner' && (
                  <div className="feature-content">
                    {aiLoading ? (
                      <div className="loading-state">Creating study plan...</div>
                    ) : studyPlan ? (
                      <div className="study-plan">
                        <div className="plan-header">
                          <h4>Your Study Plan</h4>
                          <div className="plan-meta">
                            <span>Duration: {studyPlan.duration}</span>
                            <span>•</span>
                            <span>{studyPlan.personalizedFor} learner</span>
                          </div>
                          <button
                            className="new-plan-button"
                            onClick={generateStudyPlanAI}
                          >
                            Generate New Plan
                          </button>
                        </div>
                        <div className="plan-sessions">
                          {studyPlan.sessions.map((session, index) => (
                            <div key={index} className="session-card">
                              <div className="session-header">
                                <h5>Day {session.day}: {session.title}</h5>
                                <span className="session-duration">{session.duration}</span>
                              </div>
                              <ul className="session-tasks">
                                {session.tasks.map((task, taskIndex) => (
                                  <li key={taskIndex}>{task}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="loading-state">Failed to generate plan. Try again.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudyMaterials
