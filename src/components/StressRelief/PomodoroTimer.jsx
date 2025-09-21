import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessions, setSessions] = useState(0)

  // const { user } = useAuth()

  useEffect(() => {
    let interval = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerComplete()
    } else {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  const handleTimerComplete = async () => {
    setIsActive(false)

    if (!isBreak) {
      // Work session completed
      setSessions(sessions + 1)
      setIsBreak(true)
      setTimeLeft(5 * 60) // 5 minute break

      // Update user progress
      try {
        await api.put('/users/progress', { stressReliefUsage: 1 })
      } catch (error) {
        console.error('Error updating progress:', error)
      }

      // Play notification sound or show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Work session complete!', {
          body: 'Time for a 5-minute break!',
          icon: '/favicon.ico'
        })
      }
    } else {
      // Break completed
      setIsBreak(false)
      setTimeLeft(25 * 60) // Back to 25 minutes

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Break complete!', {
          body: 'Ready for another work session?',
          icon: '/favicon.ico'
        })
      }
    }
  }

  const startTimer = () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    setIsActive(true)
  }

  const pauseTimer = () => {
    setIsActive(false)
  }

  const resetTimer = () => {
    setIsActive(false)
    setIsBreak(false)
    setTimeLeft(25 * 60)
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const progress = isBreak
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((25 * 60 - timeLeft) / (25 * 60)) * 100

  return (
    <div className="pomodoro-container">
      <div className="pomodoro-card">
        <div className="timer-header">
          <h3>{isBreak ? 'Break Time' : 'Focus Session'}</h3>
          <p>{isBreak ? 'Take a break and recharge your mind' : 'Deep focus mode - eliminate distractions'}</p>
        </div>

        <div className="timer-display">
          <div className="timer-circle">
            <svg className="progress-ring" width="200" height="200">
              <circle
                className="progress-ring-background"
                cx="100"
                cy="100"
                r="90"
                fill="transparent"
                stroke="#e6e6e6"
                strokeWidth="8"
              />
              <circle
                className="progress-ring-progress"
                cx="100"
                cy="100"
                r="90"
                fill="transparent"
                stroke={isBreak ? "#10B981" : "#3B82F6"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="timer-text">
              <div className="time">{formatTime(timeLeft)}</div>
              <div className="status">{isBreak ? 'Break' : 'Focus'}</div>
            </div>
          </div>
        </div>

        <div className="timer-controls">
          {!isActive ? (
            <button onClick={startTimer} className="timer-button primary">
              {timeLeft === (isBreak ? 5 * 60 : 25 * 60) ? 'Start' : 'Resume'}
            </button>
          ) : (
            <button onClick={pauseTimer} className="timer-button secondary">
              Pause
            </button>
          )}
          <button onClick={resetTimer} className="timer-button outline">
            Reset
          </button>
        </div>

        <div className="session-info">
          <div className="session-counter">
            <div className="session-header">
              <div className="session-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z"/>
                </svg>
              </div>
              <div className="session-label">Session Progress</div>
            </div>
            <div className="session-number">{sessions}</div>
            <div className="session-subtitle">Completed Sessions</div>
            <div className="session-stats">
              <div className="stat-row">
                <span className="stat-label">Total Focus Time</span>
                <span className="stat-value">{Math.floor(sessions * 25)}m</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Next Long Break</span>
                <span className="stat-value">{sessions < 4 ? 4 - sessions : 4 - (sessions % 4)} sessions</span>
              </div>
            </div>
          </div>

          <div className="session-counter">
            <div className="session-header">
              <div className="session-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                </svg>
              </div>
              <div className="session-label">Current Status</div>
            </div>
            <div className="session-number">{isBreak ? 'B' : 'F'}</div>
            <div className="session-subtitle">{isBreak ? 'Break Mode' : 'Focus Mode'}</div>
            <div className="session-stats">
              <div className="stat-row">
                <span className="stat-label">Timer Status</span>
                <span className="stat-value">{isActive ? 'Running' : 'Paused'}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Session Type</span>
                <span className="stat-value">{isBreak ? '5min Break' : '25min Focus'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pomodoro-tips">
          <h4>Pomodoro Tips</h4>
          <ul>
            <li>Focus on one task during each session</li>
            <li>Take short breaks between sessions</li>
            <li>After 4 sessions, take a longer break (15-30 mins)</li>
            <li>Turn off distractions during focus time</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PomodoroTimer