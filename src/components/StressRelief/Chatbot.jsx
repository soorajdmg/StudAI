import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { sendMessageToGemini } from '../../services/GeminiService'

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hi there! I'm StudAI, your personal study companion! 🧠✨ I'm here to help you with study strategies, stress relief, motivation, and anything related to your learning journey. Whether you're feeling overwhelmed, need study tips, or just want to chat about your academic goals - I'm here for you! How can I support you today?"
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const { user } = useAuth()

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-focus the textarea when component mounts
  useEffect(() => {
    const focusInput = () => {
      textareaRef.current?.focus()
    }

    // Focus immediately
    focusInput()

    // Also focus after a short delay to ensure modal is fully rendered
    const timer = setTimeout(focusInput, 100)

    return () => clearTimeout(timer)
  }, [])

  const predefinedResponses = {
    // Greetings
    'hello': "Hello! 😊 I'm so glad you're here! How can I support your learning journey today? Whether you need study tips, stress relief, or just someone to talk to about your academic goals - I'm here for you!",
    'hi': "Hi there! 🌟 What's on your mind about your studies? I'm here to help with anything from exam prep to managing stress!",
    'hey': "Hey! 👋 I'm excited to help you succeed! What can we work on together today?",

    // Stress and anxiety
    'stressed': "I hear you, and what you're feeling is completely valid. 💜 Stress is your mind's way of saying you care about your success! Try this: take 3 deep breaths, write down your top 3 priorities for today, and tackle just one small task. You don't have to carry everything at once. What's weighing on you most right now?",
    'anxious': "Anxiety before studying is so normal - it shows you care! 🫂 Here's a quick technique: the 4-7-8 breathing (inhale 4, hold 7, exhale 8). Also try the '5-4-3-2-1' grounding method: notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. What specific topic is making you feel anxious?",
    'overwhelmed': "I completely understand that feeling. 🌈 When everything feels too much, try a 'brain dump': write down EVERYTHING on your mind for 5 minutes, then circle just 3 things you can actually do today. Remember: you're not behind, you're exactly where you need to be. What feels most urgent right now?",

    // Study tips based on learning style
    'study tips': `Perfect! As a ${user?.learningProfile || 'mixed'} learner, you have some amazing strengths! 📚 ${user?.learningProfile === 'visual' ? 'Try colorful mind maps, diagrams, and visual flashcards!' : user?.learningProfile === 'auditory' ? 'Record yourself explaining concepts, study with others, and use educational podcasts!' : user?.learningProfile === 'kinesthetic' ? 'Use hands-on activities, take movement breaks, and try studying in different locations!' : 'Mix visual, auditory, and hands-on approaches - variety is your superpower!'} What subject are you working on?`,
    'focus': "Focus struggles are so common - you're definitely not alone! 🎯 Try the Pomodoro Technique (25 min study + 5 min break), create a distraction-free zone, and start with just 10 minutes if 25 feels too long. What's your biggest distraction right now?",
    'motivation': "You're here asking for help - that already shows incredible dedication! 🌟 Remember your 'why' - what made you start this journey? Every expert was once a beginner, and every small step matters. What subject are you working on? Let's break it into bite-sized wins!",

    // Encouragement
    'tired': "Rest is productive too! 😴 Your brain consolidates memories during sleep, so taking breaks isn't lazy - it's strategic! Make sure you're drinking water, getting some sunlight, and honoring your body's needs. How have you been sleeping lately?",
    'failing': "Hey, you're not failing - you're learning! 💪 Every 'mistake' is data that helps you improve. What feels like failure today often becomes the foundation for tomorrow's success. What specific challenge can we tackle together?",
    'give up': "I hear how hard this feels right now. 🫂 But look how far you've already come! Sometimes we need to adjust our approach, not our goals. What if we made this easier for a bit? What's one tiny step you could take today?",

    // General encouragement
    'thanks': "You're so welcome! 🌟 I'm genuinely happy to support you. Remember, asking for help is a sign of strength, not weakness. I'm always here when you need encouragement or study strategies!",
    'bye': "Take care! 🌈 Remember: you're capable of amazing things, and I believe in you completely. Come back anytime you need support, motivation, or just want to share your wins! You've got this! 💪",

    // Default responses
    'default': [
      "I'd love to learn more about what you're working on! 📚 What subject or challenge can I help you with today?",
      "You came to the right place for support! 🌟 What's your biggest study concern right now?",
      "I'm here to help you succeed! 💪 Tell me about your current learning goals - what would make the biggest difference for you?",
      "Every learning journey has ups and downs, and that's totally normal! 🌈 What would be most helpful for you today?",
      "You're taking such a positive step by seeking support! 😊 What can we tackle together?"
    ]
  }

  const getBotResponse = async (userMessage) => {
    try {
      const response = await sendMessageToGemini(userMessage, user)
      return response
    } catch (error) {
      console.error('Error getting AI response:', error)

      // Fallback to predefined responses if AI fails
      const message = userMessage.toLowerCase()

      // Check for keywords in the message
      for (const [key, response] of Object.entries(predefinedResponses)) {
        if (key !== 'default' && message.includes(key)) {
          return Array.isArray(response)
            ? response[Math.floor(Math.random() * response.length)]
            : response
        }
      }

      // Learning style specific responses
      if (message.includes('how to study') || message.includes('study method')) {
        const learningTips = {
          visual: "As a visual learner, try: mind maps, colorful notes, diagrams, and flashcards with images. Organize information visually!",
          auditory: "As an auditory learner, try: recording yourself reading notes, study groups, explaining concepts out loud, and listening to educational podcasts.",
          kinesthetic: "As a kinesthetic learner, try: taking breaks to move around, using physical flashcards, hands-on activities, and studying in different locations.",
          mixed: "As a mixed learner, combine different approaches: visual aids, discussion, and hands-on practice. Variety is your strength!"
        }
        return learningTips[user?.learningProfile] || learningTips.mixed
      }

      // Return random default response
      const defaultResponses = predefinedResponses.default
      return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessageContent = inputMessage
    const newUserMessage = {
      type: 'user',
      content: userMessageContent
    }

    setMessages(prev => [...prev, newUserMessage])
    setInputMessage('')
    setIsTyping(true)

    // Refocus the textarea after sending
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 50)

    try {
      // Get AI response
      const botResponseContent = await getBotResponse(userMessageContent)

      const botResponse = {
        type: 'bot',
        content: botResponseContent
      }

      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorResponse = {
        type: 'bot',
        content: "I'm having trouble thinking right now, but I'm here for you! Can you try asking me again?"
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)

      // Keep focus on textarea after bot responds
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickButtons = [
    { text: "Feeling overwhelmed", message: "I'm feeling overwhelmed with my studies and need help managing stress" },
    { text: "Study tips", message: "Can you give me study tips based on my learning style?" },
    { text: "Can't focus", message: "I'm having trouble focusing while studying. What can I do?" },
    { text: "Need motivation", message: "I'm struggling with motivation and need encouragement to keep studying" }
  ]

  const handleQuickButton = (message) => {
    setInputMessage(message)
    // Focus textarea after setting quick message
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 50)
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-card">
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-avatar">
                {message.type === 'user' ? '👤' : (
                  <svg width="24" height="24" viewBox="0 0 32 32" className="logo-icon-svg">
                    <circle cx="16" cy="16" r="16" fill="#E8E5FF" />
                    <g transform="translate(8, 8)" fill="#8B5CF6">
                      <path d="M8 2C6.5 2 5 3 4.5 4.5C4 4 3 4 2.5 4.5C2 5 2 6 2.5 6.5C2 7 2 8 2.5 8.5C2 9 2 10 2.5 10.5C3 11 4 11 4.5 10.5C5 11.5 6.5 12.5 8 12.5C9.5 12.5 11 11.5 11.5 10.5C12 11 13 11 13.5 10.5C14 10 14 9 13.5 8.5C14 8 14 7 13.5 6.5C14 6 14 5 13.5 4.5C13 4 12 4 11.5 4.5C11 3 9.5 2 8 2Z" />
                      <circle cx="6" cy="6" r="1" fill="#E8E5FF" />
                      <circle cx="10" cy="6" r="1" fill="#E8E5FF" />
                      <circle cx="8" cy="9" r="1" fill="#E8E5FF" />
                    </g>
                  </svg>
                )}
              </div>
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message bot-message">
              <div className="message-avatar">
                <svg width="24" height="24" viewBox="0 0 32 32" className="logo-icon-svg">
                  <circle cx="16" cy="16" r="16" fill="#E8E5FF" />
                  <g transform="translate(8, 8)" fill="#8B5CF6">
                    <path d="M8 2C6.5 2 5 3 4.5 4.5C4 4 3 4 2.5 4.5C2 5 2 6 2.5 6.5C2 7 2 8 2.5 8.5C2 9 2 10 2.5 10.5C3 11 4 11 4.5 10.5C5 11.5 6.5 12.5 8 12.5C9.5 12.5 11 11.5 11.5 10.5C12 11 13 11 13.5 10.5C14 10 14 9 13.5 8.5C14 8 14 7 13.5 6.5C14 6 14 5 13.5 4.5C13 4 12 4 11.5 4.5C11 3 9.5 2 8 2Z" />
                    <circle cx="6" cy="6" r="1" fill="#E8E5FF" />
                    <circle cx="10" cy="6" r="1" fill="#E8E5FF" />
                    <circle cx="8" cy="9" r="1" fill="#E8E5FF" />
                  </g>
                </svg>
              </div>
              <div className="message-content typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="quick-buttons">
          {quickButtons.map((button, index) => (
            <button
              key={index}
              className="quick-button"
              onClick={() => handleQuickButton(button.message)}
            >
              {button.text}
            </button>
          ))}
        </div>

        <div className="chatbot-input-container">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            rows="2"
            disabled={isTyping}
            autoFocus
          />
          <button
            onClick={sendMessage}
            className="send-button"
            disabled={!inputMessage.trim() || isTyping}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chatbot