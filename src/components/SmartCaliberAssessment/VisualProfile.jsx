import { useState, useEffect, useRef } from 'react'
import AIAnalysisEngine from './AIAnalysisEngine'
import './VisualProfile.css'

// Radar Chart Component
const RadarChart = ({ data, labels, title, colors = ['#667eea', '#38b2ac'] }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 40

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw radar grid
    drawRadarGrid(ctx, centerX, centerY, radius, labels.length)

    // Draw data
    if (data.length > 0) {
      data.forEach((dataset, index) => {
        drawRadarData(ctx, centerX, centerY, radius, dataset, labels, colors[index] || colors[0], index === 0 ? 0.3 : 0.2)
      })
    }

    // Draw labels
    drawRadarLabels(ctx, centerX, centerY, radius, labels)
  }, [data, labels, colors])

  const drawRadarGrid = (ctx, centerX, centerY, radius, sides) => {
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1

    // Draw concentric circles
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI)
      ctx.stroke()
    }

    // Draw lines from center to each vertex
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const drawRadarData = (ctx, centerX, centerY, radius, dataset, labels, color, opacity) => {
    if (!dataset || dataset.length === 0) return

    ctx.strokeStyle = color
    ctx.fillStyle = color + Math.round(opacity * 255).toString(16).padStart(2, '0')
    ctx.lineWidth = 2

    ctx.beginPath()
    dataset.forEach((value, index) => {
      const angle = (index * 2 * Math.PI) / labels.length - Math.PI / 2
      const distance = (value / 100) * radius
      const x = centerX + distance * Math.cos(angle)
      const y = centerY + distance * Math.sin(angle)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Draw points
    dataset.forEach((value, index) => {
      const angle = (index * 2 * Math.PI) / labels.length - Math.PI / 2
      const distance = (value / 100) * radius
      const x = centerX + distance * Math.cos(angle)
      const y = centerY + distance * Math.sin(angle)

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()
    })
  }

  const drawRadarLabels = (ctx, centerX, centerY, radius, labels) => {
    ctx.fillStyle = '#4a5568'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    labels.forEach((label, index) => {
      const angle = (index * 2 * Math.PI) / labels.length - Math.PI / 2
      const labelRadius = radius + 20
      const x = centerX + labelRadius * Math.cos(angle)
      const y = centerY + labelRadius * Math.sin(angle)

      ctx.fillText(label, x, y)
    })
  }

  return (
    <div className="radar-chart-container">
      <h4 className="radar-title">{title}</h4>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="radar-canvas"
      />
    </div>
  )
}

// Progress Ring Component
const ProgressRing = ({ value, label, color = '#667eea', size = 120 }) => {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="progress-ring">
      <svg width={size} height={size} className="progress-ring-svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="progress-circle"
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dy="0.3em"
          className="progress-text"
        >
          {value}%
        </text>
      </svg>
      <p className="progress-label">{label}</p>
    </div>
  )
}

// Metric Card Component
const MetricCard = ({ icon, title, value, description, trend, color = '#667eea' }) => {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <div className="metric-icon" style={{ color }}>
          {icon}
        </div>
        <div className="metric-info">
          <h4>{title}</h4>
          <div className="metric-value">
            {value}
            {trend && (
              <span className={`metric-trend ${trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral'}`}>
                {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="metric-description">{description}</p>
    </div>
  )
}

// Strength/Weakness Indicator
const StrengthIndicator = ({ strengths, growthAreas }) => {
  return (
    <div className="strength-indicator">
      <div className="strengths-section">
        <h4>🎯 Top Strengths</h4>
        <ul className="strength-list">
          {strengths.map((strength, index) => (
            <li key={index} className="strength-item">
              <span className="strength-icon">✓</span>
              {strength}
            </li>
          ))}
        </ul>
      </div>

      <div className="growth-section">
        <h4>📈 Growth Areas</h4>
        <ul className="growth-list">
          {growthAreas.map((area, index) => (
            <li key={index} className="growth-item">
              <span className="growth-icon">◯</span>
              {area}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Performance Timeline Component
const PerformanceTimeline = ({ performanceData }) => {
  const maxValue = Math.max(...performanceData.map(d => Math.max(d.accuracy, d.speed, d.engagement)))

  return (
    <div className="performance-timeline">
      <h4>📊 Performance Timeline</h4>
      <div className="timeline-chart">
        <svg viewBox="0 0 400 200" className="timeline-svg">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="40"
              y1={160 - y * 1.2}
              x2="360"
              y2={160 - y * 1.2}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map(y => (
            <text
              key={y}
              x="30"
              y={165 - y * 1.2}
              fontSize="10"
              fill="#6b7280"
              textAnchor="end"
            >
              {y}%
            </text>
          ))}

          {/* Performance lines */}
          {performanceData.length > 1 && (
            <>
              {/* Accuracy line */}
              <polyline
                points={performanceData.map((point, index) => {
                  const x = 50 + (index * 280) / (performanceData.length - 1)
                  const y = 160 - (point.accuracy * 1.2)
                  return `${x},${y}`
                }).join(' ')}
                fill="none"
                stroke="#667eea"
                strokeWidth="2"
              />

              {/* Speed line */}
              <polyline
                points={performanceData.map((point, index) => {
                  const x = 50 + (index * 280) / (performanceData.length - 1)
                  const y = 160 - (point.speed * 1.2)
                  return `${x},${y}`
                }).join(' ')}
                fill="none"
                stroke="#38b2ac"
                strokeWidth="2"
              />

              {/* Engagement line */}
              <polyline
                points={performanceData.map((point, index) => {
                  const x = 50 + (index * 280) / (performanceData.length - 1)
                  const y = 160 - (point.engagement * 1.2)
                  return `${x},${y}`
                }).join(' ')}
                fill="none"
                stroke="#ed8936"
                strokeWidth="2"
              />
            </>
          )}

          {/* Data points */}
          {performanceData.map((point, index) => {
            const x = performanceData.length > 1
              ? 50 + (index * 280) / (performanceData.length - 1)
              : 200

            return (
              <g key={index}>
                <circle cx={x} cy={160 - point.accuracy * 1.2} r="3" fill="#667eea" />
                <circle cx={x} cy={160 - point.speed * 1.2} r="3" fill="#38b2ac" />
                <circle cx={x} cy={160 - point.engagement * 1.2} r="3" fill="#ed8936" />
              </g>
            )
          })}
        </svg>

        <div className="timeline-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#667eea' }}></span>
            Accuracy
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#38b2ac' }}></span>
            Speed
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#ed8936' }}></span>
            Engagement
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Visual Profile Component
const VisualProfile = ({ testResults, sessionData, userPreferences }) => {
  const [analysisResults, setAnalysisResults] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (testResults && sessionData) {
      const engine = new AIAnalysisEngine()
      const results = engine.analyzeCaliberProfile(testResults, sessionData, userPreferences)
      setAnalysisResults(results)
    }
  }, [testResults, sessionData, userPreferences])

  if (!analysisResults) {
    return (
      <div className="visual-profile-loading">
        <div className="loading-spinner"></div>
        <p>Analyzing your learning caliber...</p>
      </div>
    )
  }

  const renderOverview = () => {
    const { caliberType, metrics, profiles } = analysisResults

    // Prepare radar chart data
    const cognitiveData = [
      profiles.speed.index,
      profiles.accuracy.overall,
      profiles.behavioral.engagementScore,
      profiles.authenticity.score,
      profiles.speed.consistency
    ]

    const radarLabels = ['Speed', 'Accuracy', 'Engagement', 'Authenticity', 'Consistency']

    // Mock performance timeline data
    const timelineData = [
      { accuracy: 76, speed: 45, engagement: 60 },
      { accuracy: 82, speed: 55, engagement: 70 },
      { accuracy: 88, speed: 65, engagement: 80 },
      { accuracy: 84, speed: 70, engagement: 75 },
      { accuracy: 91, speed: 75, engagement: 85 }
    ]

    return (
      <div className="profile-overview">
        {/* Caliber Type Header */}
        <div className="caliber-header">
          <div className="caliber-badge">
            <h2>{caliberType.profile.name}</h2>
            <p>{caliberType.profile.description}</p>
            <div className="confidence-indicator">
              Confidence: {caliberType.confidence}%
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="metrics-grid">
          <ProgressRing
            value={metrics.breakdown.accuracy}
            label="Accuracy"
            color="#667eea"
          />
          <ProgressRing
            value={metrics.breakdown.speed}
            label="Speed"
            color="#38b2ac"
          />
          <ProgressRing
            value={metrics.breakdown.engagement}
            label="Engagement"
            color="#ed8936"
          />
          <ProgressRing
            value={metrics.breakdown.consistency}
            label="Consistency"
            color="#805ad5"
          />
        </div>

        {/* Radar Chart */}
        <div className="radar-section">
          <RadarChart
            data={[cognitiveData]}
            labels={radarLabels}
            title="Cognitive Profile Analysis"
            colors={['#667eea']}
          />
        </div>

        {/* Performance Timeline */}
        <PerformanceTimeline performanceData={timelineData} />

        {/* Strengths and Growth Areas */}
        <StrengthIndicator
          strengths={metrics.strengths}
          growthAreas={metrics.growthAreas}
        />
      </div>
    )
  }

  const renderDetailed = () => {
    const { profiles } = analysisResults

    return (
      <div className="detailed-analysis">
        <h3>📋 Detailed Profile Analysis</h3>

        <div className="analysis-sections">
          {/* Speed Analysis */}
          <div className="analysis-section">
            <h4>⚡ Speed Profile</h4>
            <div className="metric-cards-grid">
              <MetricCard
                icon="⏱️"
                title="Processing Speed"
                value={`${profiles.speed.averageTime}s`}
                description={`${profiles.speed.classification} processor`}
                color="#667eea"
              />
              <MetricCard
                icon="🎯"
                title="Speed Index"
                value={profiles.speed.index}
                description="Relative speed performance"
                color="#38b2ac"
              />
              <MetricCard
                icon="📊"
                title="Consistency"
                value={`${profiles.speed.consistency}%`}
                description="Response time stability"
                color="#ed8936"
              />
            </div>
          </div>

          {/* Accuracy Analysis */}
          <div className="analysis-section">
            <h4>🎯 Accuracy Profile</h4>
            <div className="accuracy-breakdown">
              <div className="difficulty-accuracy">
                {Object.entries(profiles.accuracy.byDifficulty || {}).map(([difficulty, data]) => (
                  <div key={difficulty} className="difficulty-stat">
                    <span className={`difficulty-label ${difficulty}`}>{difficulty}</span>
                    <span className="accuracy-value">{data.percentage}%</span>
                    <div className="accuracy-bar">
                      <div
                        className="accuracy-fill"
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Behavioral Analysis */}
          <div className="analysis-section">
            <h4>🧠 Behavioral Pattern</h4>
            <div className="behavioral-grid">
              <div className="behavioral-stat">
                <h5>Learning Strategy</h5>
                <p>{profiles.behavioral.learningStrategy}</p>
              </div>
              <div className="behavioral-stat">
                <h5>Interaction Style</h5>
                <p>{profiles.behavioral.interactionStyle}</p>
              </div>
              <div className="behavioral-stat">
                <h5>Stress Level</h5>
                <p className={`stress-${profiles.behavioral.stressLevel}`}>
                  {profiles.behavioral.stressLevel}
                </p>
              </div>
              <div className="behavioral-stat">
                <h5>Persistence</h5>
                <p>{profiles.behavioral.persistence}%</p>
              </div>
            </div>
          </div>

          {/* Style Authenticity */}
          <div className="analysis-section">
            <h4>📖 Learning Style Analysis</h4>
            <div className="style-analysis">
              <div className="style-comparison">
                <div className="declared-style">
                  <h5>Declared Preference</h5>
                  <p>{profiles.authenticity.declaredPreference}</p>
                </div>
                <div className="actual-style">
                  <h5>Best Performance</h5>
                  <p>{profiles.authenticity.actualBestFormat}</p>
                </div>
                <div className="authenticity-score">
                  <h5>Authenticity</h5>
                  <p className={profiles.authenticity.isAuthentic ? 'authentic' : 'misaligned'}>
                    {profiles.authenticity.score}%
                  </p>
                </div>
              </div>

              <div className="format-performance">
                {Object.entries(profiles.authenticity.formatPerformance).map(([format, data]) => (
                  <div key={format} className="format-stat">
                    <span className="format-name">{format}</span>
                    <div className="format-bar">
                      <div
                        className="format-fill"
                        style={{ width: `${data.accuracy}%` }}
                      ></div>
                    </div>
                    <span className="format-accuracy">{data.accuracy}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderInsights = () => {
    const { insights, recommendations } = analysisResults

    return (
      <div className="insights-recommendations">
        <div className="insights-section">
          <h3>💡 Key Insights</h3>
        </div>

        <div className="recommendations-section">
          <h3>🎯 Personalized Recommendations</h3>
          <div className="recommendations-list">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-item">
                <div className="recommendation-icon">💡</div>
                <p>{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'detailed', name: 'Detailed Analysis', icon: '🔬' },
    { id: 'insights', name: 'Insights & Tips', icon: '💡' }
  ]

  return (
    <div className="visual-profile">
      <div className="profile-header">
        <h1>🎯 Your Learning Caliber Profile</h1>
        <p>Comprehensive analysis based on behavioral patterns and performance data</p>
      </div>

      <div className="profile-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      <div className="profile-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'detailed' && renderDetailed()}
        {activeTab === 'insights' && renderInsights()}
      </div>
    </div>
  )
}

export default VisualProfile