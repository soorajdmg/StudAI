import { useState, useEffect } from 'react'
// import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState('inhale') // 'inhale', 'hold', 'exhale'
  const [count, setCount] = useState(4)
  const [cycle, setCycle] = useState(0)
  const [totalCycles, setTotalCycles] = useState(5)

  useEffect(() => {
    let interval = null

    if (isActive) {
      interval = setInterval(() => {
        setCount(prevCount => {
          if (prevCount > 1) {
            return prevCount - 1
          } else {
            handlePhaseComplete()
            return getNextPhaseCount()
          }
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isActive, phase])

  const getNextPhaseCount = () => {
    switch (phase) {
      case 'inhale':
        return 4 // Hold for 4 seconds
      case 'hold':
        return 4 // Exhale for 4 seconds
      case 'exhale':
        return 4 // Inhale for 4 seconds
      default:
        return 4
    }
  }

  const handlePhaseComplete = async () => {
    switch (phase) {
      case 'inhale':
        setPhase('hold')
        break
      case 'hold':
        setPhase('exhale')
        break
      case 'exhale':
        setCycle(prevCycle => {
          const newCycle = prevCycle + 1
          if (newCycle >= totalCycles) {
            handleExerciseComplete()
            return 0
          }
          return newCycle
        })
        setPhase('inhale')
        break
    }
  }

  const handleExerciseComplete = async () => {
    setIsActive(false)

    try {
      await api.put('/users/progress', { stressReliefUsage: 1 })
    } catch (error) {
      console.error('Error updating progress:', error)
    }

    // Show completion message
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Breathing exercise complete!', {
        body: 'Great job! You should feel more relaxed now.',
        icon: '/favicon.ico'
      })
    }
  }

  const startExercise = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    setIsActive(true)
    setPhase('inhale')
    setCount(4)
    setCycle(0)
  }

  const stopExercise = () => {
    setIsActive(false)
    setPhase('inhale')
    setCount(4)
    setCycle(0)
  }

  const getPhaseInstructions = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe in slowly...'
      case 'hold':
        return 'Hold your breath...'
      case 'exhale':
        return 'Breathe out slowly...'
      default:
        return 'Get ready...'
    }
  }

  const getCircleSize = () => {
    switch (phase) {
      case 'inhale':
        return 120 + (4 - count) * 20 // Expand
      case 'hold':
        return 200 // Stay large
      case 'exhale':
        return 200 - (4 - count) * 20 // Contract
      default:
        return 120
    }
  }

  const getCircleColor = () => {
    switch (phase) {
      case 'inhale':
        return '#3B82F6' // Blue
      case 'hold':
        return '#8B5CF6' // Purple
      case 'exhale':
        return '#10B981' // Green
      default:
        return '#6B7280' // Gray
    }
  }

  return (
    <div className="breathing-container">
      <div className="breathing-card">
        <div className="breathing-header">
          <h3>🫁 Breathing Exercise</h3>
          <p>Follow the circle and breathe mindfully</p>
        </div>

        <div className="breathing-display">
          <div className="breathing-animation">
            <div
              className="breathing-circle"
              style={{
                width: `${getCircleSize()}px`,
                height: `${getCircleSize()}px`,
                backgroundColor: getCircleColor(),
                transition: isActive ? 'all 1s ease-in-out' : 'none'
              }}
            >
              <div className="breathing-text">
                <div className="breathing-count">{count}</div>
                <div className="breathing-phase">{phase.charAt(0).toUpperCase() + phase.slice(1)}</div>
              </div>
            </div>
          </div>

          <div className="breathing-instructions">
            <p className="instruction-text">{getPhaseInstructions()}</p>
            {isActive && (
              <div className="cycle-progress">
                Cycle {cycle + 1} of {totalCycles}
              </div>
            )}
          </div>
        </div>

        <div className="breathing-controls">
          {!isActive ? (
            <button onClick={startExercise} className="breathing-button primary">
              Start Breathing Exercise
            </button>
          ) : (
            <button onClick={stopExercise} className="breathing-button secondary">
              Stop Exercise
            </button>
          )}
        </div>

        <div className="breathing-settings">
          <div className="setting-group">
            <label htmlFor="cycles">Number of cycles:</label>
            <select
              id="cycles"
              value={totalCycles}
              onChange={(e) => setTotalCycles(Number(e.target.value))}
              disabled={isActive}
            >
              <option value={3}>3 cycles</option>
              <option value={5}>5 cycles</option>
              <option value={10}>10 cycles</option>
            </select>
          </div>
        </div>

        <div className="breathing-benefits">
          <h4>Benefits of Breathing Exercises:</h4>
          <ul>
            <li>Reduces stress and anxiety</li>
            <li>Improves focus and concentration</li>
            <li>Lowers heart rate and blood pressure</li>
            <li>Promotes relaxation and better sleep</li>
            <li>Increases mindfulness and self-awareness</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BreathingExercise