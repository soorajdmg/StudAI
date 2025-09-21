import { useState, useEffect } from 'react'
import api from '../../utils/api'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    learningTypeStats: [],
    avgProgress: { avgTasksCompleted: 0, avgStressReliefUsage: 0 }
  })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAnalytics()
    fetchUsers()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/users/analytics')
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/all')
      setUsers(response.data.users)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
    }
  }

  const getLearningTypePercentage = (type) => {
    const total = analytics.learningTypeStats.reduce((sum, stat) => sum + stat.count, 0)
    const typeData = analytics.learningTypeStats.find(stat => stat._id === type)
    return total > 0 ? Math.round((typeData?.count || 0) / total * 100) : 0
  }

  const getLearningTypeInfo = (type) => {
    const info = {
      visual: { name: 'Visual Learners', icon: '🎨', color: '#4F46E5' },
      auditory: { name: 'Auditory Learners', icon: '🎧', color: '#059669' },
      kinesthetic: { name: 'Kinesthetic Learners', icon: '✋', color: '#DC2626' },
      mixed: { name: 'Mixed Learners', icon: '🌟', color: '#7C3AED' }
    }
    return info[type] || { name: 'Unknown', icon: '❓', color: '#6B7280' }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>📊 Admin Dashboard</h2>
        <p>StudAI Analytics and User Management</p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          Insights
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{analytics.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <h3>{Math.round(analytics.avgProgress.avgTasksCompleted)}</h3>
                <p>Avg Tasks Completed</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🧘</div>
              <div className="stat-content">
                <h3>{Math.round(analytics.avgProgress.avgStressReliefUsage)}</h3>
                <p>Avg Stress Relief Usage</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <h3>{analytics.learningTypeStats.length}</h3>
                <p>Learning Types Active</p>
              </div>
            </div>
          </div>

          <div className="learning-distribution">
            <h3>Learning Style Distribution</h3>
            <div className="distribution-grid">
              {['visual', 'auditory', 'kinesthetic', 'mixed'].map(type => {
                const percentage = getLearningTypePercentage(type)
                const info = getLearningTypeInfo(type)
                const count = analytics.learningTypeStats.find(stat => stat._id === type)?.count || 0

                return (
                  <div key={type} className="distribution-card">
                    <div className="distribution-header">
                      <span className="distribution-icon">{info.icon}</span>
                      <span className="distribution-name">{info.name}</span>
                    </div>
                    <div className="distribution-stats">
                      <div className="distribution-percentage">{percentage}%</div>
                      <div className="distribution-count">({count} users)</div>
                    </div>
                    <div className="distribution-bar">
                      <div
                        className="distribution-fill"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: info.color
                        }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-section">
          <div className="users-header">
            <h3>User Management</h3>
            <div className="users-count">Total: {users.length} users</div>
          </div>

          <div className="users-table">
            <div className="table-header">
              <div>Name</div>
              <div>Email</div>
              <div>Learning Style</div>
              <div>Progress</div>
              <div>Joined</div>
              <div>Status</div>
            </div>

            {users.map(user => {
              const learningInfo = getLearningTypeInfo(user.learningProfile)
              return (
                <div key={user._id} className="table-row">
                  <div className="user-name">
                    {user.name}
                    {user.isAdmin && <span className="admin-badge">Admin</span>}
                  </div>
                  <div className="user-email">{user.email}</div>
                  <div className="user-learning">
                    {user.learningProfile ? (
                      <span className="learning-badge" style={{ backgroundColor: learningInfo.color }}>
                        {learningInfo.icon} {learningInfo.name}
                      </span>
                    ) : (
                      <span className="learning-badge incomplete">Not Set</span>
                    )}
                  </div>
                  <div className="user-progress">
                    <div className="progress-item">
                      📚 {user.progress.tasksCompleted}
                    </div>
                    <div className="progress-item">
                      🧘 {user.progress.stressReliefUsage}
                    </div>
                  </div>
                  <div className="user-date">
                    {formatDate(user.createdAt)}
                  </div>
                  <div className="user-status">
                    <span className="status-active">Active</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="insights-section">
          <h3>Platform Insights</h3>

          <div className="insights-grid">
            <div className="insight-card">
              <h4>🎯 Engagement Metrics</h4>
              <div className="insight-content">
                <div className="metric">
                  <span className="metric-label">Users who completed learning test:</span>
                  <span className="metric-value">
                    {users.filter(u => u.learningProfile).length}/{users.length}
                    ({users.length > 0 ? Math.round(users.filter(u => u.learningProfile).length / users.length * 100) : 0}%)
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Active stress relief users:</span>
                  <span className="metric-value">
                    {users.filter(u => u.progress.stressReliefUsage > 0).length}
                    ({users.length > 0 ? Math.round(users.filter(u => u.progress.stressReliefUsage > 0).length / users.length * 100) : 0}%)
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Productive users (&gt;5 tasks):</span>
                  <span className="metric-value">
                    {users.filter(u => u.progress.tasksCompleted > 5).length}
                    ({users.length > 0 ? Math.round(users.filter(u => u.progress.tasksCompleted > 5).length / users.length * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="insight-card">
              <h4>📈 Usage Patterns</h4>
              <div className="insight-content">
                <div className="pattern">
                  <strong>Most Popular Learning Style:</strong>
                  {analytics.learningTypeStats.length > 0 && (
                    <span className="popular-style">
                      {getLearningTypeInfo(
                        analytics.learningTypeStats.reduce((a, b) => a.count > b.count ? a : b)._id
                      ).name}
                    </span>
                  )}
                </div>
                <div className="pattern">
                  <strong>Average Tasks per User:</strong>
                  {Math.round(analytics.avgProgress.avgTasksCompleted)}
                </div>
                <div className="pattern">
                  <strong>Stress Relief Adoption:</strong>
                  {users.length > 0 ? Math.round(users.filter(u => u.progress.stressReliefUsage > 0).length / users.length * 100) : 0}%
                </div>
              </div>
            </div>

            <div className="insight-card">
              <h4>💡 Recommendations</h4>
              <div className="insight-content">
                <ul>
                  <li>Encourage more users to complete the learning style assessment</li>
                  <li>Promote stress relief tools to improve user well-being</li>
                  <li>Consider adding more content for the most popular learning style</li>
                  <li>Implement user engagement campaigns for inactive users</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard