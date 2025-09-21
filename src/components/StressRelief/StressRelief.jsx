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
      name: 'Focus Timer',
      icon: '🕐',
      description: 'Pomodoro sessions'
    },
    {
      id: 'breathing',
      name: 'Breathing',
      icon: '🧘‍♀️',
      description: 'Relaxation exercises'
    },
    {
      id: 'chatbot',
      name: 'AI Coach',
      icon: '🤖',
      description: 'Study guidance'
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

      <div className="simple-tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`simple-tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className="tab-icon">{tab.icon}</div>
            <div className="tab-info">
              <div className="tab-name">{tab.name}</div>
              <div className="tab-description">{tab.description}</div>
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