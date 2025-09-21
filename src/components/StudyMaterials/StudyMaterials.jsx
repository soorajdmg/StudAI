import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  analyzeDocument,
  generateStudyPlanFromDocument,
  generateAITutorResponse,
  generateQuizFromDocument
} from '../../services/GeminiService'
import './StudyMaterials.css'

const StudyMaterials = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('documents')
  const [documents, setDocuments] = useState([])
  const [currentDocument, setCurrentDocument] = useState(null)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [studyPlan, setStudyPlan] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [quizData, setQuizData] = useState(null)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const fileInputRef = useRef(null)
  const chatEndRef = useRef(null)

  // Initialize with welcome message
  useEffect(() => {
    setChatMessages([
      {
        type: 'ai',
        content: `Hello ${user?.name || 'there'}! I'm your AI Study Assistant. I can help you analyze documents, generate quizzes, create study plans, and answer questions about your materials. Upload a document or ask me anything!`,
        timestamp: new Date()
      }
    ])
  }, [user?.name])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

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
    }
    reader.readAsText(file)
  }

  const analyzeDocumentContent = async (document) => {
    if (!document) return

    setAiLoading(true)
    try {
      console.log('🔍 Starting document analysis with AI...')
      const analysis = await analyzeDocument(
        document.content,
        document.name,
        user?.learningProfile || 'Mixed'
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

  const generateStudyPlanAI = async () => {
    if (!currentDocument?.analysis) return

    setAiLoading(true)
    try {
      console.log('📅 Generating AI study plan...')
      const plan = await generateStudyPlanFromDocument(
        currentDocument.analysis,
        user?.learningProfile || 'Mixed',
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
        content: "I'm having trouble connecting right now, but I'm here to help! Can you tell me more about what you're studying?",
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, fallbackResponse])
    }
  }

  const generateQuizAI = async () => {
    if (!currentDocument) return

    setIsGeneratingQuiz(true)
    try {
      console.log('🎯 Generating AI quiz...')
      const quiz = await generateQuizFromDocument(
        currentDocument.content,
        currentDocument.name,
        user?.learningProfile || 'Mixed'
      )

      console.log('✅ Quiz generated:', quiz)
      setQuizData(quiz)
    } catch (error) {
      console.error('Error generating quiz:', error)
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  return (
    <div className="study-materials-container">
      <div className="study-materials-header">
        <h2>AI Study Materials</h2>
        <p>Transform your documents into intelligent learning experiences</p>
      </div>

      <div className="study-materials-content">
        <div className="study-tabs">
          <button
            className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Document Analysis
          </button>
          <button
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            AI Tutor Chat
          </button>
          <button
            className={`tab-button ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            Smart Quizzes
          </button>
          <button
            className={`tab-button ${activeTab === 'planner' ? 'active' : ''}`}
            onClick={() => setActiveTab('planner')}
          >
            Study Planner
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'documents' && (
            <div className="documents-tab">
              <div className="documents-grid">
                {documents.map(doc => (
                <div
                  key={doc.id}
                  className={`document-card ${currentDocument?.id === doc.id ? 'selected' : ''}`}
                  onClick={() => setCurrentDocument(doc)}
                >
                  <div className="document-header">
                    <div className="document-icon">📄</div>
                    <h4>{doc.name}</h4>
                    {doc.processed && <span className="processed-badge">Analyzed</span>}
                  </div>
                  <p className="document-meta">
                    {(doc.size / 1024).toFixed(1)} KB • {doc.uploadDate.toLocaleDateString()}
                  </p>
                  {!doc.processed && (
                    <button
                      className="analyze-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        analyzeDocumentContent(doc)
                      }}
                      disabled={aiLoading}
                    >
                      {aiLoading ? 'Analyzing...' : 'Analyze with AI'}
                    </button>
                  )}
                </div>
                ))}
              </div>

              <div className="upload-section">
                {documents.length === 0 && (
                  <div className="upload-prompt">
                    <h4>Get started with AI-powered analysis</h4>
                    <p>Upload your study documents to unlock intelligent insights, personalized quizzes, and custom study plans.</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.pdf,.doc,.docx"
                  style={{ display: 'none' }}
                />
                <button
                  className="upload-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {documents.length === 0 ? 'Upload Your First Document' : 'Upload Another Document'}
                </button>
                {documents.length === 0 && (
                  <p className="upload-note">Supports TXT, PDF, DOC, and DOCX files</p>
                )}
              </div>

            {aiAnalysis && (
              <div className="analysis-results">
                <h3>AI Analysis Results</h3>
                <div className="analysis-grid">
                  <div className="analysis-card">
                    <h4>Summary</h4>
                    <p>{aiAnalysis.summary}</p>
                  </div>
                  <div className="analysis-card">
                    <h4>Key Topics</h4>
                    <div className="topics-list">
                      {aiAnalysis.keyTopics.map((topic, index) => (
                        <span key={index} className="topic-tag">{topic}</span>
                      ))}
                    </div>
                  </div>
                  <div className="analysis-card">
                    <h4>Concepts Identified</h4>
                    <div className="concepts-list">
                      {aiAnalysis.concepts.map((concept, index) => (
                        <div key={index} className="concept-item">
                          <span>{concept.name}</span>
                          <div className="confidence-bar">
                            <div
                              className="confidence-fill"
                              style={{ width: `${concept.confidence}%` }}
                            ></div>
                          </div>
                          <span className="confidence-text">{concept.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="analysis-card">
                    <h4>AI Recommendations</h4>
                    <ul>
                      {aiAnalysis.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="chat-tab">
            <div className="chat-container">
              <div className="chat-messages">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`message ${message.type}`}>
                    <div className="message-avatar">
                      {message.type === 'ai' ? 'AI' : 'You'}
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
                  placeholder="Ask me anything about your study materials..."
                  className="chat-input"
                />
                <button type="submit" className="chat-send-button">
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="quiz-tab">
            {!quizData ? (
              <div className="quiz-generator">
                <div className="quiz-intro">
                  <h3>AI-Powered Quiz Generation</h3>
                  <p>Generate personalized quizzes from your uploaded documents</p>
                </div>
                <button
                  className="generate-quiz-button"
                  onClick={generateQuizAI}
                  disabled={!currentDocument || isGeneratingQuiz}
                >
                  {isGeneratingQuiz ? 'Generating Quiz...' : 'Generate Smart Quiz'}
                </button>
              </div>
            ) : (
              <div className="quiz-content">
                <h3>{quizData.title}</h3>
                <p className="quiz-meta">
                  Adapted for {quizData.adaptedFor} learners • {quizData.questions.length} questions
                </p>
                <div className="quiz-questions">
                  {quizData.questions.map((question, index) => (
                    <div key={question.id} className="quiz-question">
                      <h4>Question {index + 1}</h4>
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
                      {question.type === 'short-answer' && (
                        <textarea
                          className="quiz-textarea"
                          placeholder="Type your answer here..."
                        />
                      )}
                    </div>
                  ))}
                </div>
                <button
                  className="new-quiz-button"
                  onClick={() => setQuizData(null)}
                >
                  Generate New Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="planner-tab">
            {!studyPlan ? (
              <div className="planner-generator">
                <div className="planner-intro">
                  <h3>Personalized Study Planner</h3>
                  <p>Create AI-powered study schedules based on your documents and learning style</p>
                </div>
                <button
                  className="generate-plan-button"
                  onClick={generateStudyPlanAI}
                  disabled={!currentDocument?.analysis || aiLoading}
                >
                  {aiLoading ? 'Creating Plan...' : 'Generate Study Plan'}
                </button>
              </div>
            ) : (
              <div className="study-plan">
                <h3>Your Personalized Study Plan</h3>
                <div className="plan-meta">
                  <span>Duration: {studyPlan.duration}</span>
                  <span>•</span>
                  <span>Optimized for {studyPlan.personalizedFor} learners</span>
                </div>
                <div className="plan-sessions">
                  {studyPlan.sessions.map((session, index) => (
                    <div key={index} className="session-card">
                      <div className="session-header">
                        <h4>Day {session.day}: {session.title}</h4>
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
                <button
                  className="new-plan-button"
                  onClick={() => setStudyPlan(null)}
                >
                  Generate New Plan
                </button>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default StudyMaterials