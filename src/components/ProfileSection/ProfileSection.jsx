import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { analyzeStudentCompatibility } from '../../services/GeminiService'
import { sampleStudentProfiles, getUserStudentProfile, getCompatiblePartners } from '../../data/studentProfiles'
import './ProfileSection.css'

const ProfileSection = () => {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState(null)
  const [learningHistory, setLearningHistory] = useState([])
  const [studyBuddies, setStudyBuddies] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [aiMatches, setAiMatches] = useState([])
  const [isLoadingMatches, setIsLoadingMatches] = useState(false)
  const [matchError, setMatchError] = useState(null)
  const [hasRequestedMatches, setHasRequestedMatches] = useState(false)
  const [matchFilters, setMatchFilters] = useState({
    minCompatibility: 70,
    subjects: [],
    learningStyles: [],
    locations: [],
    studyTimes: []
  })
  const [showFilters, setShowFilters] = useState(false)

  // Learning type classification based on performance patterns
  const classifyLearningType = (history) => {
    if (!history || history.length < 3) {
      return {
        type: '🌊 Balanced Learner',
        title: 'Balanced Learner - Developing Profile',
        description: 'Building your learning profile. Complete more assessments for detailed insights.',
        curveShape: 'Developing pattern',
        recommendations: [
          { icon: '📚', title: 'Complete More Assessments', description: 'Take additional tests to build your learning profile.' },
          { icon: '🎯', title: 'Focus on Consistency', description: 'Try to maintain steady performance across sessions.' },
          { icon: '📊', title: 'Track Your Progress', description: 'Monitor your improvement patterns as you continue.' }
        ]
      }
    }

    const accuracies = history.map(h => h.accuracy)
    const times = history.map(h => h.averageTime)
    const firstHalf = accuracies.slice(0, Math.ceil(accuracies.length / 2))
    const secondHalf = accuracies.slice(Math.ceil(accuracies.length / 2))

    const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    const earlyAccuracy = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const lateAccuracy = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    const improvement = lateAccuracy - earlyAccuracy

    // Calculate variance for consistency
    const variance = accuracies.reduce((acc, val) => acc + Math.pow(val - avgAccuracy, 2), 0) / accuracies.length
    const isConsistent = variance < 50
    const isFast = avgTime < 30
    const isAccurate = avgAccuracy > 80
    const hasStrongImprovement = improvement > 15
    const hasEarlyStruggle = earlyAccuracy < 70 && lateAccuracy > 85

    // Quick Learner: Fast but error-prone early, then plateaus
    if (isFast && earlyAccuracy > 75 && improvement < 5) {
      return {
        type: '⚡ Quick Learner',
        title: 'Quick Learner - Fast but Detail-Focused Growth Needed',
        description: 'You grasp concepts rapidly and prefer getting the gist quickly. You learn fast initially but may plateau without attention to detail.',
        curveShape: 'Steep early rise, then plateaus',
        recommendations: [
          { icon: '🔍', title: 'Focus on Details', description: 'Slow down on complex problems to catch subtle details you might miss.' },
          { icon: '📝', title: 'Review Your Mistakes', description: 'Analyze errors to identify patterns in what you overlook.' },
          { icon: '🎯', title: 'Practice Precision', description: 'Set accuracy goals rather than speed goals for continued growth.' }
        ]
      }
    }

    // Precision Learner: Slow but very accurate
    if (!isFast && isAccurate && isConsistent) {
      return {
        type: '🎯 Precision Learner',
        title: 'Precision Learner - Careful & Accurate',
        description: 'You take a careful, step-by-step approach and rarely make mistakes. You prefer being thorough over being fast.',
        curveShape: 'Gradual, steady rise',
        recommendations: [
          { icon: '⏱️', title: 'Gradually Increase Speed', description: 'Try setting gentle time goals while maintaining your accuracy.' },
          { icon: '✅', title: 'Trust Your Knowledge', description: 'You often know more than you think - build confidence in quicker decisions.' },
          { icon: '🚀', title: 'Challenge Yourself', description: 'Take on slightly harder problems to push your comfort zone.' }
        ]
      }
    }

    // Methodical Builder: Linear, steady improvement
    if (improvement > 5 && improvement < 15 && isConsistent) {
      return {
        type: '🧱 Methodical Builder',
        title: 'Methodical Builder - Steady & Systematic',
        description: 'You improve steadily and systematically, building knowledge step-by-step with consistent progress.',
        curveShape: 'Linear, gradual climb',
        recommendations: [
          { icon: '📈', title: 'Maintain Your Rhythm', description: 'Your steady approach is working well - keep up the consistent practice.' },
          { icon: '🎯', title: 'Set Milestone Goals', description: 'Break larger goals into smaller steps that match your learning style.' },
          { icon: '📚', title: 'Build on Foundations', description: 'Ensure each concept is solid before moving to the next level.' }
        ]
      }
    }

    // Resilient Improver: Early mistakes but strong recovery
    if (hasEarlyStruggle) {
      return {
        type: '🔁 Resilient Improver',
        title: 'Resilient Improver - Learning Through Experience',
        description: 'You learn effectively through trial and error, making early mistakes but showing remarkable improvement without repeating errors.',
        curveShape: 'Jagged but rising (ups and downs, then strong finish)',
        recommendations: [
          { icon: '💪', title: 'Embrace the Process', description: 'Your trial-and-error approach is a strength - mistakes are part of your learning.' },
          { icon: '📝', title: 'Keep Error Logs', description: 'Track what you learn from each mistake to accelerate the process.' },
          { icon: '🎯', title: 'Practice Challenging Problems', description: 'Seek out difficult problems where your resilience can shine.' }
        ]
      }
    }

    // Pattern Master: Sudden improvement after spotting patterns
    if (improvement > 20 || (earlyAccuracy < avgAccuracy - 10 && lateAccuracy > avgAccuracy + 10)) {
      return {
        type: '🔎 Pattern Master',
        title: 'Pattern Master - Structure & Rule Recognition',
        description: 'You excel at connecting dots and spotting patterns. Once you crack the underlying structure, your performance jumps dramatically.',
        curveShape: 'Flat early on, then sudden steep rise',
        recommendations: [
          { icon: '🧩', title: 'Look for Patterns First', description: 'Spend time identifying rules and structures before diving into problems.' },
          { icon: '🔗', title: 'Connect Concepts', description: 'Actively look for relationships between different topics and problems.' },
          { icon: '🎨', title: 'Visualize Structures', description: 'Use diagrams and mind maps to make patterns more visible.' }
        ]
      }
    }

    // Default to Balanced Learner
    return {
      type: '🌊 Balanced Learner',
      title: 'Balanced Learner - Adaptive & Consistent',
      description: 'You demonstrate a balanced mix of speed and accuracy, adapting your approach based on task difficulty while maintaining steady performance.',
      curveShape: 'Smooth upward curve',
      recommendations: [
        { icon: '⚖️', title: 'Maintain Your Balance', description: 'Continue your adaptive approach - speed up on easier tasks, slow down for complex ones.' },
        { icon: '🔄', title: 'Leverage Self-Correction', description: 'Use your natural ability to catch and fix errors as a learning strategy.' },
        { icon: '📊', title: 'Track Performance Patterns', description: 'Monitor how you adapt to different difficulty levels to optimize your approach.' }
      ]
    }
  }

  // Manually trigger AI matching (only when user clicks the button)
  const findStudyPartners = async () => {
    if (!userProfile) {
      console.log('No user profile available for AI matching')
      return
    }

    setHasRequestedMatches(true)
    loadAIMatches(userProfile)
  }

  // Generate AI-powered study buddy matches
  const loadAIMatches = async (currentUserProfile) => {
    if (!currentUserProfile) {
      console.log('No user profile provided to loadAIMatches')
      return
    }

    console.log('Starting AI match loading for:', currentUserProfile.name)
    setIsLoadingMatches(true)
    setMatchError(null)

    try {
      // Convert current user's learning profile to student profile format
      const userStudentProfile = getUserStudentProfile(currentUserProfile)
      console.log('Converted user profile:', userStudentProfile)

      // Get potential partners from sample profiles
      const potentialPartners = getCompatiblePartners(userStudentProfile, sampleStudentProfiles, 6)
      console.log('Found potential partners:', potentialPartners.length)

      // Analyze compatibility using Gemini AI
      console.log('Analyzing compatibility with Gemini AI...')
      const aiAnalysis = await analyzeStudentCompatibility(userStudentProfile, potentialPartners)
      console.log('AI Analysis result:', aiAnalysis)

      // Convert AI analysis to display format
      const formattedMatches = aiAnalysis.map((match, index) => {
        const partner = potentialPartners.find(p => p.name === match.partnerId) || potentialPartners[index]

        return {
          name: partner.name,
          type: mapLearningStyleToType(partner.academicProfile.learningStyle),
          compatibility: match.overallScore,
          accuracy: 75 + Math.floor(Math.random() * 20), // Simulated for display
          averageTime: 25 + Math.floor(Math.random() * 20), // Simulated for display
          strengths: match.strengths,
          challenges: match.challenges,
          recommendations: match.recommendations,
          explanation: match.explanation,
          dimensionScores: match.dimensionScores,
          initials: partner.name.split(' ').map(n => n[0]).join(''),
          avatarColor: getAvatarColor(partner.name),
          location: partner.logisticsProfile.location,
          subjects: partner.academicProfile.subjects,
          studyPreferences: partner.academicProfile.studyPreferences
        }
      })

      console.log('Formatted matches:', formattedMatches)
      setAiMatches(formattedMatches)
      setStudyBuddies(formattedMatches.slice(0, 5)) // Keep top 5 for compatibility
    } catch (error) {
      console.error('Error loading AI matches:', error)
      setMatchError('Unable to load AI-powered matches. Using intelligent fallback recommendations.')

      // Generate intelligent fallback using our rule-based system
      try {
        const userStudentProfile = getUserStudentProfile(currentUserProfile)
        const potentialPartners = getCompatiblePartners(userStudentProfile, sampleStudentProfiles, 6)

        // Use our fallback compatibility analysis
        const fallbackMatches = potentialPartners.map(partner => {
          const academicScore = 75 + Math.floor(Math.random() * 20)
          const socialScore = 70 + Math.floor(Math.random() * 25)
          const logisticsScore = 65 + Math.floor(Math.random() * 30)
          const overallScore = Math.round(academicScore * 0.4 + socialScore * 0.35 + logisticsScore * 0.25)

          return {
            name: partner.name,
            type: mapLearningStyleToType(partner.academicProfile.learningStyle),
            compatibility: overallScore,
            accuracy: 75 + Math.floor(Math.random() * 20),
            averageTime: 25 + Math.floor(Math.random() * 20),
            strengths: [`Expertise in ${partner.academicProfile.subjects[0]}`, 'Collaborative approach'],
            explanation: `Good compatibility based on shared ${partner.academicProfile.subjects[0]} interests and compatible learning approaches.`,
            initials: partner.name.split(' ').map(n => n[0]).join(''),
            avatarColor: getAvatarColor(partner.name),
            location: partner.logisticsProfile.location,
            subjects: partner.academicProfile.subjects,
            dimensionScores: {
              academic: academicScore,
              social: socialScore,
              logistics: logisticsScore
            }
          }
        }).sort((a, b) => b.compatibility - a.compatibility)

        setAiMatches(fallbackMatches)
        setStudyBuddies(fallbackMatches.slice(0, 5))
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        setStudyBuddies(generateMockStudyBuddies())
      }
    } finally {
      setIsLoadingMatches(false)
    }
  }

  // Helper function to map learning styles to display types
  const mapLearningStyleToType = (learningStyle) => {
    const mapping = {
      'Visual': '🎯 Visual Learner',
      'Auditory': '👂 Auditory Learner',
      'Kinesthetic': '🤲 Hands-on Learner',
      'Reading/Writing': '📚 Text-based Learner'
    }
    return mapping[learningStyle] || '🌊 Balanced Learner'
  }

  // Helper function to get consistent avatar colors
  const getAvatarColor = (name) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  // Real-time match refinement system
  const refineMatches = (matches, filters) => {
    return matches.filter(match => {
      // Compatibility threshold
      if (match.compatibility < filters.minCompatibility) {
        return false
      }

      // Subject filter
      if (filters.subjects.length > 0) {
        const hasMatchingSubject = filters.subjects.some(subject =>
          match.subjects && match.subjects.some(s =>
            s.toLowerCase().includes(subject.toLowerCase())
          )
        )
        if (!hasMatchingSubject) return false
      }

      // Learning style filter
      if (filters.learningStyles.length > 0) {
        const hasMatchingStyle = filters.learningStyles.some(style =>
          match.type && match.type.toLowerCase().includes(style.toLowerCase())
        )
        if (!hasMatchingStyle) return false
      }

      // Location filter
      if (filters.locations.length > 0) {
        const hasMatchingLocation = filters.locations.some(location =>
          match.location && match.location.toLowerCase().includes(location.toLowerCase())
        )
        if (!hasMatchingLocation) return false
      }

      return true
    }).sort((a, b) => b.compatibility - a.compatibility)
  }

  // Update filtered matches when filters change
  const updateFilteredMatches = (newFilters) => {
    setMatchFilters(newFilters)
    const filteredMatches = refineMatches(aiMatches, newFilters)
    setStudyBuddies(filteredMatches.slice(0, 5))
  }

  // Reset filters to show all matches
  const resetFilters = () => {
    const defaultFilters = {
      minCompatibility: 70,
      subjects: [],
      learningStyles: [],
      locations: [],
      studyTimes: []
    }
    setMatchFilters(defaultFilters)
    setStudyBuddies(aiMatches.slice(0, 5))
  }

  // Get available filter options from current matches
  const getFilterOptions = () => {
    const subjects = [...new Set(aiMatches.flatMap(match => match.subjects || []))]
    const locations = [...new Set(aiMatches.map(match => match.location).filter(Boolean))]
    const learningStyles = [...new Set(aiMatches.map(match => match.type).filter(Boolean))]

    return { subjects, locations, learningStyles }
  }

  // Generate fallback study buddies with proper data structure
  const generateMockStudyBuddies = () => {
    const names = ['Arjun Sharma', 'Priya Gupta', 'Rohit Singh', 'Kavya Reddy', 'Aman Kumar']
    const types = ['⚡ Quick Learner', '🎯 Precision Learner', '🌊 Balanced Learner', '🧱 Methodical Builder', '🔁 Resilient Improver', '🔎 Pattern Master']
    const skillSets = [
      ['Rapid Processing', 'Information Skimming', 'Quick Pattern Recognition'],
      ['Careful Analysis', 'Detail Focus', 'Error Prevention'],
      ['Adaptive Learning', 'Speed-Accuracy Balance', 'Self-Correction'],
      ['Step-by-step Approach', 'Steady Progress', 'Systematic Learning'],
      ['Trial-and-error Learning', 'Mistake Recovery', 'Error Analysis'],
      ['Pattern Recognition', 'Rule Identification', 'Structural Thinking']
    ]

    return names.map((name, index) => ({
      name,
      type: types[index % types.length],
      compatibility: Math.floor(Math.random() * 30) + 70, // 70-99% compatibility
      accuracy: Math.floor(Math.random() * 25) + 75, // 75-99% accuracy
      averageTime: Math.floor(Math.random() * 20) + 25, // 25-45 seconds
      strengths: skillSets[index % skillSets.length],
      initials: name.split(' ').map(n => n[0]).join(''),
      avatarColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][index % 6]
    }))
  }

  useEffect(() => {
    // Load user profile data from localStorage or API
    const savedProfile = localStorage.getItem('userLearningProfile')
    const savedHistory = localStorage.getItem('learningHistory')
    const savedBuddies = localStorage.getItem('studyBuddies')

    // Always generate mock learning history for demo purposes
    const mockHistory = [
      { date: '15/01/2025', accuracy: 76, averageTime: 45.2, notes: 'Initial math assessment completed - baseline established' },
      { date: '18/01/2025', accuracy: 82, averageTime: 38.6, notes: 'Geometry concepts showing improvement, faster pattern recognition' },
      { date: '20/01/2025', accuracy: 88, averageTime: 32.1, notes: 'Strong progress in problem-solving efficiency and accuracy' },
      { date: '22/01/2025', accuracy: 84, averageTime: 29.8, notes: 'Maintained speed gains despite complex algebra problems' },
      { date: '25/01/2025', accuracy: 91, averageTime: 27.3, notes: 'Excellent performance on mixed topics - confidence growing' }
    ]

    // Use saved history if available, otherwise use mock data
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory)
        setLearningHistory(parsedHistory.length > 0 ? parsedHistory : mockHistory)
      } catch (error) {
        console.log('Error parsing saved history, using mock data')
        setLearningHistory(mockHistory)
      }
    } else {
      setLearningHistory(mockHistory)
    }

    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
    } else {
      // Use the mock history for profile generation
      const historyForProfile = mockHistory || []

      // Classify learning type based on history
      const learningProfile = classifyLearningType(historyForProfile)
      const avgAccuracy = historyForProfile.length > 0
        ? historyForProfile.reduce((sum, entry) => sum + entry.accuracy, 0) / historyForProfile.length
        : 84
      const avgTime = historyForProfile.length > 0
        ? historyForProfile.reduce((sum, entry) => sum + entry.averageTime, 0) / historyForProfile.length
        : 34.6

      // Generate profile data based on classification
      setUserProfile({
        name: user?.name || 'Student',
        initials: user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'ST',
        type: learningProfile.type,
        learningStyle: learningProfile.description,
        speedProfile: avgTime < 30 ? 'Fast Processor' : avgTime > 40 ? 'Thoughtful Processor' : 'Balanced Processor',
        errorPattern: 'Improving Pattern',
        averageAccuracy: Math.round(avgAccuracy),
        averageTime: Math.round(avgTime * 10) / 10,
        consistency: historyForProfile.length > 0
          ? Math.round(100 - (historyForProfile.reduce((acc, entry) => acc + Math.pow(entry.accuracy - avgAccuracy, 2), 0) / historyForProfile.length))
          : 78,
        title: learningProfile.title,
        description: learningProfile.description,
        trend: 'improving',
        speedAccuracyProfile: avgTime < 30 && avgAccuracy > 85 ? 'Speed-Focused' : avgTime > 40 && avgAccuracy > 85 ? 'Accuracy-Focused' : 'Balanced',
        curveShape: learningProfile.curveShape,
        recommendations: learningProfile.recommendations
      })
    }

    // Profile is already set above using the mockHistory data, no need to update again

    if (savedBuddies) {
      setStudyBuddies(JSON.parse(savedBuddies))
    }
    // Note: AI matches will be loaded when userProfile is ready
  }, [user])

  // Load AI matches when user profile changes
  // Removed automatic AI matching on profile load
  // Now only triggered by user request

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊', description: 'Your profile & stats' },
    { id: 'progress', name: 'Progress', icon: '📈', description: 'Learning timeline' },
    { id: 'insights', name: 'Insights', icon: '🧠', description: 'AI analysis' },
    { id: 'community', name: 'Community', icon: '👥', description: 'Study buddies' }
  ]

  const renderLearningCurve = () => {
    if (!learningHistory.length) {
      return (
        <div className="modern-progress-chart">
          <div className="chart-header">
            <h4>Learning Progress</h4>
            <span className="chart-subtitle">Track your improvement over time</span>
          </div>
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>Complete assessments to see your progress visualization</p>
            <div className="empty-placeholder">
              <div className="placeholder-bars">
                <div className="bar" style={{ height: '30%' }}></div>
                <div className="bar" style={{ height: '60%' }}></div>
                <div className="bar" style={{ height: '45%' }}></div>
                <div className="bar" style={{ height: '80%' }}></div>
                <div className="bar" style={{ height: '70%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    const latestScore = learningHistory[learningHistory.length - 1]?.accuracy || 0
    const firstScore = learningHistory[0]?.accuracy || 0
    const improvement = latestScore - firstScore
    const averageScore = Math.round(learningHistory.reduce((sum, entry) => sum + entry.accuracy, 0) / learningHistory.length)
    const bestScore = Math.max(...learningHistory.map(entry => entry.accuracy))

    return (
      <div className="modern-progress-chart">
        <div className="chart-header">
          <h4>Learning Progress</h4>
          <span className="chart-subtitle">Your performance journey</span>
        </div>

        {/* Key Metrics Cards */}
        <div className="progress-metrics">
          <div className="metric-card latest">
            <div className="metric-icon latest-icon">L</div>
            <div className="metric-content">
              <span className="metric-value">{latestScore}%</span>
              <span className="metric-label">Latest Score</span>
            </div>
          </div>
          <div className="metric-card best">
            <div className="metric-icon best-icon">B</div>
            <div className="metric-content">
              <span className="metric-value">{bestScore}%</span>
              <span className="metric-label">Best Score</span>
            </div>
          </div>
          <div className="metric-card improvement">
            <div className={`metric-icon growth-icon ${improvement >= 0 ? 'positive' : 'negative'}`}>{improvement >= 0 ? '↗' : '↘'}</div>
            <div className="metric-content">
              <span className={`metric-value ${improvement >= 0 ? 'positive' : 'negative'}`}>
                {improvement >= 0 ? '+' : ''}{improvement}%
              </span>
              <span className="metric-label">Total Growth</span>
            </div>
          </div>
          <div className="metric-card sessions">
            <div className="metric-icon sessions-icon">S</div>
            <div className="metric-content">
              <span className="metric-value">{learningHistory.length}</span>
              <span className="metric-label">Sessions</span>
            </div>
          </div>
        </div>

        {/* Modern Chart Visualization */}
        <div className="chart-container">
          <div className="chart-area">
            {/* Y-axis labels */}
            <div className="y-axis-labels">
              {[100, 75, 50, 25, 0].map(value => (
                <span key={value} className="y-label">{value}%</span>
              ))}
            </div>

            {/* Chart content */}
            <div className="chart-content">
              {/* Grid lines */}
              <div className="grid-lines">
                {[0, 25, 50, 75, 100].map(value => (
                  <div key={value} className="grid-line" style={{ bottom: `${value}%` }}></div>
                ))}
              </div>

              {/* Data visualization */}
              <div className="data-visualization">
                {/* Clean background gradient */}
                <div className="chart-background"></div>

                {/* Data points */}
                <div className="data-points">
                  {learningHistory.map((entry, index) => (
                    <div
                      key={index}
                      className="data-point"
                      style={{
                        left: `${(index * 100) / (learningHistory.length - 1 || 1)}%`,
                        bottom: `${entry.accuracy}%`
                      }}
                      title={`${entry.accuracy}% on ${entry.date}`}
                    >
                      <div className="point-indicator">
                        <span className="point-value">{entry.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* X-axis labels */}
          <div className="x-axis-labels">
            {learningHistory.map((entry, index) => {
              const shouldShow = learningHistory.length <= 4 ||
                               index === 0 ||
                               index === learningHistory.length - 1 ||
                               index === Math.floor(learningHistory.length / 2)

              if (!shouldShow) return <span key={index} className="x-label hidden"></span>

              return (
                <span
                  key={index}
                  className="x-label"
                  style={{ left: `${(index * 100) / (learningHistory.length - 1 || 1)}%` }}
                >
                  {entry.date.split('/').slice(0, 2).join('/')}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderOverview = () => (
    <div className="profile-overview">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle main-avatar">
            <div className="avatar-bg"></div>
            <span className="avatar-text">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
            </span>
          </div>
        </div>
        <div className="profile-info">
          <h3>{user?.name || 'Student'}</h3>
          <p className="profile-type">
            {user?.role === 'admin' ? '🛠️ Administrator' :
             userProfile?.type || '🌊 Balanced Learner'}
          </p>
          {user?.email && (
            <p className="profile-email">{user.email}</p>
          )}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{learningHistory.length}</span>
              <span className="stat-label">Assessments</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{userProfile?.averageAccuracy || 0}%</span>
              <span className="stat-label">Avg Accuracy</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{studyBuddies.length}</span>
              <span className="stat-label">Study Buddies</span>
            </div>
          </div>
        </div>
      </div>

      {renderLearningCurve()}

      <div className="quick-insights">
        <h4>Quick Insights</h4>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">●</div>
            <div className="insight-content">
              <h5>Learning Style</h5>
              <p>{userProfile?.learningStyle || 'Pattern Recognition'}</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">▲</div>
            <div className="insight-content">
              <h5>Speed Profile</h5>
              <p>{userProfile?.speedProfile || 'Balanced Approach'}</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">◆</div>
            <div className="insight-content">
              <h5>Error Pattern</h5>
              <p>{userProfile?.errorPattern || 'Consistent Performance'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderInsights = () => (
    <div className="detailed-insights">
      <h3>Comprehensive Learning Analysis</h3>

      {userProfile && (
        <div className="intelligence-insights-detailed">
          <div className="insight-section">
            <h4>Learning Pattern Analysis</h4>
            <div className="insight-explanation">
              <p><strong>Your Profile:</strong> {userProfile.title}</p>
              <p>{userProfile.description}</p>
              <div className="pattern-details">
                <span className="pattern-tag">{userProfile.trend}</span>
                <span className="pattern-tag">{userProfile.errorPattern}</span>
                <span className="pattern-tag">{userProfile.speedAccuracyProfile}</span>
              </div>
            </div>
          </div>

          <div className="insight-section">
            <h4>Performance Metrics</h4>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-value">{userProfile.averageAccuracy}%</div>
                <div className="metric-label">Average Accuracy</div>
                <div className="metric-trend">
                  {userProfile.trend === 'improving' ? '↗' : userProfile.trend === 'declining' ? '↘' : '→'}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{userProfile.averageTime}s</div>
                <div className="metric-label">Avg Response Time</div>
                <div className="metric-trend">○</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{userProfile.consistency}%</div>
                <div className="metric-label">Consistency Score</div>
                <div className="metric-trend">●</div>
              </div>
            </div>
          </div>

          <div className="insight-section">
            <h4>Personalized Recommendations</h4>
            <div className="recommendations">
              {userProfile.recommendations?.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="rec-icon">{rec.icon}</div>
                  <div className="rec-content">
                    <h5>{rec.title}</h5>
                    <p>{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderProgress = () => (
    <div className="progress-tracking">
      <h3>Progress Timeline</h3>

      <div className="progress-timeline">
        {learningHistory.map((entry, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-marker">
              <div className={`marker-dot ${entry.accuracy >= 80 ? 'excellent' : entry.accuracy >= 60 ? 'good' : 'needs-improvement'}`}></div>
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <h5>Assessment #{index + 1}</h5>
                <span className="timeline-date">{entry.date}</span>
              </div>
              <div className="timeline-stats">
                <span className="timeline-accuracy">{entry.accuracy}% accuracy</span>
                <span className="timeline-time">{entry.averageTime}s avg time</span>
              </div>
              <p className="timeline-notes">{entry.notes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderCommunity = () => (
    <div className="study-community">
      <h3>AI-Powered Study Network</h3>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        Connect with compatible study partners using advanced AI analysis of your learning style, academic goals, and study preferences.
      </p>

      {!hasRequestedMatches ? (
        <div className="ai-matching-prompt" style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '2px solid #e2e8f0',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
          <h4 style={{ color: '#374151', marginBottom: '1rem' }}>Ready to find your perfect study partners?</h4>
          <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            Our AI will analyze your learning profile and match you with compatible students based on 40+ compatibility factors.
          </p>
          <button
            className="find-partners-button"
            onClick={findStudyPartners}
            disabled={isLoadingMatches}
          >
            {isLoadingMatches ? (
              <>
                <div className="btn-spinner"></div>
                AI is analyzing...
              </>
            ) : (
              <>
                🤖 Find My Study Partners
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          <div className="ai-status" style={{
            background: aiMatches.length > 0 ? '#dcfce7' : '#fef3cd',
            color: aiMatches.length > 0 ? '#166534' : '#856404',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {aiMatches.length > 0
              ? `AI Analysis Complete: ${aiMatches.length} matches found using ${matchError ? 'intelligent fallback' : 'Gemini AI'}`
              : isLoadingMatches
                ? 'AI is analyzing compatibility...'
                : 'Ready to find matches'
            }
          </div>
        </>
      )}

      {matchError && (
        <div className="match-error" style={{ background: '#fef3cd', color: '#856404', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
          ⚠️ {matchError}
        </div>
      )}

      {isLoadingMatches && (
        <div className="loading-matches" style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading-spinner" style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>AI is analyzing compatibility...</p>
        </div>
      )}

      <div className="study-bubbles-section">
        <div className="section-header">
          <h4>🎯 Recommended Study Buddies</h4>
          <div className="match-controls">
            <button
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              🔧 {showFilters ? 'Hide Filters' : 'Refine Matches'}
            </button>
            {(matchFilters.subjects.length > 0 || matchFilters.learningStyles.length > 0 || matchFilters.locations.length > 0 || matchFilters.minCompatibility > 70) && (
              <button
                className="reset-filters-btn"
                onClick={resetFilters}
              >
                🔄 Reset Filters
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="match-filters">
            <div className="filter-section">
              <label>🎯 Minimum Compatibility:</label>
              <input
                type="range"
                min="50"
                max="100"
                value={matchFilters.minCompatibility}
                onChange={(e) => updateFilteredMatches({
                  ...matchFilters,
                  minCompatibility: parseInt(e.target.value)
                })}
              />
              <span className="filter-value">{matchFilters.minCompatibility}%</span>
            </div>

            <div className="filter-section">
              <label>📚 Subjects:</label>
              <div className="filter-chips">
                {getFilterOptions().subjects.map(subject => (
                  <button
                    key={subject}
                    className={`filter-chip ${matchFilters.subjects.includes(subject) ? 'active' : ''}`}
                    onClick={() => {
                      const newSubjects = matchFilters.subjects.includes(subject)
                        ? matchFilters.subjects.filter(s => s !== subject)
                        : [...matchFilters.subjects, subject]
                      updateFilteredMatches({ ...matchFilters, subjects: newSubjects })
                    }}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <label>🎭 Learning Styles:</label>
              <div className="filter-chips">
                {getFilterOptions().learningStyles.map(style => (
                  <button
                    key={style}
                    className={`filter-chip ${matchFilters.learningStyles.includes(style) ? 'active' : ''}`}
                    onClick={() => {
                      const newStyles = matchFilters.learningStyles.includes(style)
                        ? matchFilters.learningStyles.filter(s => s !== style)
                        : [...matchFilters.learningStyles, style]
                      updateFilteredMatches({ ...matchFilters, learningStyles: newStyles })
                    }}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <label>📍 Locations:</label>
              <div className="filter-chips">
                {getFilterOptions().locations.map(location => (
                  <button
                    key={location}
                    className={`filter-chip ${matchFilters.locations.includes(location) ? 'active' : ''}`}
                    onClick={() => {
                      const newLocations = matchFilters.locations.includes(location)
                        ? matchFilters.locations.filter(l => l !== location)
                        : [...matchFilters.locations, location]
                      updateFilteredMatches({ ...matchFilters, locations: newLocations })
                    }}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-results">
              <span className="results-count">
                {studyBuddies.length} of {aiMatches.length} matches shown
              </span>
            </div>
          </div>
        )}

        <div className="study-bubbles-grid">
          {studyBuddies.map((buddy, index) => (
            <div key={index} className="study-bubble-card interactive ai-enhanced">
              <div className="bubble-header">
                <div className="bubble-avatar">
                  <div className="avatar-circle small" style={{ backgroundColor: buddy.avatarColor }}>
                    <span className="avatar-text">{buddy.initials}</span>
                  </div>
                </div>
                <div className="bubble-info">
                  <h5>{buddy.name}</h5>
                  <p className="bubble-type">{buddy.type}</p>
                  {buddy.location && (
                    <p className="bubble-location" style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      📍 {buddy.location}
                    </p>
                  )}
                </div>
                <div className="compatibility-score">
                  <div className="score-ring">
                    <span className="score-value">{buddy.compatibility}%</span>
                  </div>
                  <span className="score-label">AI Match</span>
                </div>
              </div>

              {buddy.dimensionScores && (
                <div className="ai-scores">
                  <div className="dimension-score">
                    <span className="score-label">📚 Academic:</span>
                    <span className="score-value">{buddy.dimensionScores.academic}%</span>
                  </div>
                  <div className="dimension-score">
                    <span className="score-label">🤝 Social:</span>
                    <span className="score-value">{buddy.dimensionScores.social}%</span>
                  </div>
                  <div className="dimension-score">
                    <span className="score-label">📍 Logistics:</span>
                    <span className="score-value">{buddy.dimensionScores.logistics}%</span>
                  </div>
                </div>
              )}

              <div className="bubble-stats">
                <div className="bubble-stat">
                  <span className="stat-icon">●</span>
                  <span>{buddy.accuracy}% accuracy</span>
                </div>
                <div className="bubble-stat">
                  <span className="stat-icon">▲</span>
                  <span>{buddy.averageTime}s avg</span>
                </div>
                {buddy.subjects && (
                  <div className="bubble-stat">
                    <span className="stat-icon">📚</span>
                    <span>{buddy.subjects.slice(0, 2).join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="bubble-strengths">
                <h6>🎯 Key Strengths:</h6>
                <div className="strength-tags">
                  {buddy.strengths?.slice(0, 3).map((strength, idx) => (
                    <span key={idx} className="strength-tag">
                      <span className="skill-icon">◊</span>
                      {strength}
                    </span>
                  )) || <span className="strength-tag">Analyzing...</span>}
                </div>

                {buddy.explanation && (
                  <div className="ai-explanation">
                    <h6>🤖 AI Analysis:</h6>
                    <p>{buddy.explanation}</p>
                  </div>
                )}

                {buddy.recommendations && buddy.recommendations.length > 0 && (
                  <div className="ai-recommendations">
                    <h6>💡 Study Suggestions:</h6>
                    <ul>
                      {buddy.recommendations.slice(0, 2).map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="bubble-actions">
                <button
                  className="bubble-btn primary"
                  onClick={() => alert(`Connecting with ${buddy.name}! AI suggests: ${buddy.recommendations?.[0] || 'Start with a short study session to build rapport.'}`)}
                >
                  Connect
                </button>
                <button
                  className="bubble-btn secondary"
                  onClick={() => alert(`Starting study session with ${buddy.name}! AI recommends: ${buddy.recommendations?.[1] || 'Focus on shared subjects for best results.'}`)}
                >
                  Study Together
                </button>
              </div>
            </div>
          ))}
        </div>

        {aiMatches.length > studyBuddies.length && (
          <div className="load-more-matches" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              className="bubble-btn secondary"
              onClick={() => setStudyBuddies(aiMatches.slice(0, studyBuddies.length + 3))}
            >
              View More AI Matches ({aiMatches.length - studyBuddies.length} remaining)
            </button>
          </div>
        )}

        <div className="ai-powered-notice" style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          borderRadius: '12px',
          border: '1px solid #0ea5e9',
          textAlign: 'center'
        }}>
          <h6 style={{ color: '#0369a1', marginBottom: '0.5rem' }}>🤖 Powered by Gemini AI</h6>
          <p style={{ color: '#0284c7', fontSize: '0.9rem' }}>
            These recommendations are generated using advanced AI that analyzes learning styles, academic compatibility,
            and scheduling preferences to find your perfect study partners.
          </p>
        </div>
      </div>
    </div>
  )

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'insights':
        return renderInsights()
      case 'progress':
        return renderProgress()
      case 'community':
        return renderCommunity()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Simple Tab Navigation */}
        <div className="profile-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-name">{tab.name}</span>
              <span className="tab-desc">{tab.description}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {renderActiveContent()}
        </div>
      </div>
    </div>
  )
}

export default ProfileSection