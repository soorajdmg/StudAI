import { useState } from 'react'
import PomodoroTimer from './PomodoroTimer'
import BreathingExercise from './BreathingExercise'
import Chatbot from './Chatbot'
import './StressRelief.css'

const StressRelief = () => {
  const [activeTab, setActiveTab] = useState('pomodoro')

  const tabs = [
    {
      id: 'pomodoro',
      name: 'Focus',
      subtitle: 'Timer',
      cardClass: 'focus-card',
      icon: '?'
    },
    {
      id: 'breathing',
      name: 'Wellness',
      subtitle: 'Exercises',
      cardClass: 'breathing-card',
      icon: 'circular'
    },
    {
      id: 'chatbot',
      name: 'AI Study',
      subtitle: 'Coach',
      cardClass: 'coach-card',
      icon: 'dots'
    }
  ]

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'pomodoro':
        return <PomodoroTimer />
      case 'breathing':
        return <BreathingExercise />
      case 'chatbot':
        return <Chatbot />
      default:
        return <PomodoroTimer />
    }
  }

  return (
    <div className="stress-relief-container">

      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${tab.cardClass} ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {/* Background decorative circles */}
            <div className="tab-card-bg-decoration">
              <svg viewBox="0 0 96 96" className="tab-concentric-circles">
                <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="3" />
                <circle cx="48" cy="48" r="36" fill="none" stroke="currentColor" strokeWidth="3" />
                <circle cx="48" cy="48" r="28" fill="none" stroke="currentColor" strokeWidth="3" />
                <circle cx="48" cy="48" r="20" fill="none" stroke="currentColor" strokeWidth="3" />
                <circle cx="48" cy="48" r="12" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>

            {/* Icon with decorative elements */}
            <div className="tab-icon-container">
              <div className="tab-card-icon">
                <div className="tab-icon-inner">
                  {tab.icon === '?' && <span style={{fontSize: '1.125rem', fontWeight: 700}}>?</span>}
                  {tab.icon === 'circular' && <div style={{width: '1.5rem', height: '1.5rem', background: 'currentColor', borderRadius: '50%'}}></div>}
                  {tab.icon === 'dots' && (
                    <div style={{display: 'flex', gap: '0.25rem', alignItems: 'center', justifyContent: 'center'}}>
                      <div style={{width: '0.5rem', height: '0.5rem', background: 'currentColor', borderRadius: '50%'}}></div>
                      <div style={{width: '0.5rem', height: '0.5rem', background: 'currentColor', borderRadius: '50%'}}></div>
                    </div>
                  )}
                </div>
                {/* Decorative X marks */}
                <span className="tab-x-mark tab-x-1">×</span>
                <span className="tab-x-mark tab-x-2">×</span>
                <span className="tab-x-mark tab-x-3">×</span>
              </div>
            </div>

            <div className="tab-card-content">
              <h3 className="tab-name">{tab.name}</h3>
              <h4 className="tab-subtitle">{tab.subtitle}</h4>
            </div>
          </button>
        ))}
      </div>

      <div className="tab-content-container">
        {renderActiveComponent()}
      </div>
    </div>
  )
}

export default StressRelief