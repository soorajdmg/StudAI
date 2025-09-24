import React from 'react';
import { Link } from 'react-router-dom';
import './StudAILanding.css';

const StudAILanding = () => {
  return (
    <div className="studai-landing">
      {/* Header */}
      <header className="landing-header">
        <div className="header-logo">
          <div className="logo-icon">
            <svg width="40" height="40" viewBox="0 0 32 32" className="logo-icon-svg">
              <circle cx="16" cy="16" r="16" fill="#E8E5FF" />
              <g transform="translate(8, 8)" fill="#8B5CF6">
                <path d="M8 2C6.5 2 5 3 4.5 4.5C4 4 3 4 2.5 4.5C2 5 2 6 2.5 6.5C2 7 2 8 2.5 8.5C2 9 2 10 2.5 10.5C3 11 4 11 4.5 10.5C5 11.5 6.5 12.5 8 12.5C9.5 12.5 11 11.5 11.5 10.5C12 11 13 11 13.5 10.5C14 10 14 9 13.5 8.5C14 8 14 7 13.5 6.5C14 6 14 5 13.5 4.5C13 4 12 4 11.5 4.5C11 3 9.5 2 8 2Z" />
                <circle cx="6" cy="6" r="1" fill="#E8E5FF" />
                <circle cx="10" cy="6" r="1" fill="#E8E5FF" />
                <circle cx="8" cy="9" r="1" fill="#E8E5FF" />
              </g>
            </svg>
          </div>
          <span className="logo-text">Stud<span className="logo-highlight">AI</span></span>
        </div>

        <nav className="header-nav">
          <a href="#" className="nav-link nav-link-active">Home</a>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <a href="#features" className="nav-link" onClick={(e) => {
            e.preventDefault();
            document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
          }}>About</a>
          <Link to="/profile" className="nav-link">Profile</Link>
        </nav>

        <div className="header-actions">
          <Link to="/login" className="sign-in-btn">Sign In</Link>
          <Link to="/register" className="contact-btn">
            <span className="contact-text">Get Started</span>
            <div className="contact-icon-circle">
              <svg className="contact-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        {/* Background decorative elements */}
        <div className="bg-decoration bg-circle-1"></div>
        <div className="bg-decoration bg-circle-2"></div>
        <div className="bg-decoration bg-circle-3"></div>

        {/* Spiral decoration */}
        <div className="spiral-decoration">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <path d="M40 10 C60 10, 70 30, 70 40 C70 60, 50 70, 40 70 C20 70, 10 50, 10 40 C10 20, 30 10, 40 10 Z"
              fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>

        <div className="hero-content">
          {/* Child image on the left */}
          <div className="hero-decoration left-child">
            <div className="child-avatar">
              <div className="child-avatar-inner">
                <div className="child-avatar-dot"></div>
              </div>
            </div>
            {/* Arrow pointing to text */}
            <div className="pointing-arrow">
              <svg width="100" height="60" viewBox="0 0 100 60">
                <path d="M10 30 Q50 10, 90 30" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>
          </div>

          {/* Badge on the right */}
          <div className="hero-decoration badge-decoration">
            <div className="studai-badge">
              <div className="badge-content">
                <div className="badge-title">StudAI</div>
                <div className="badge-subtitle">Learning</div>
                <div className="badge-subtitle">AI</div>
              </div>
            </div>
          </div>

          {/* Child image on the right */}
          <div className="hero-decoration right-child">
            <div className="child-avatar small">
              <div className="child-avatar-inner small">
                <div className="child-avatar-dot small"></div>
              </div>
            </div>
          </div>

          <h1 className="hero-title">
            AI-powered platform to{' '}
            <span className="highlighted-word learn">
              learn
              <svg className="underline-svg" viewBox="0 0 300 20">
                <path d="M5 15 Q150 5, 295 15" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
            </span>
            {' '}and{' '}
            <span className="highlighted-word play">
              connect
              <svg className="underline-svg" viewBox="0 0 200 20">
                <path d="M5 15 Q100 5, 195 15" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
            </span>
            <br />
            intelligently
          </h1>

          <p className="hero-description">
            Unlock your learning potential with AI-powered assessments, find study partners who enhance your strengths,<br />
            and maintain peak mental wellness throughout your academic journey.
          </p>

          <Link to="/register" className="get-started-btn">
            <span className="get-started-text">Get Started</span>
            <div className="get-started-icon-circle">
              <svg className="get-started-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </main>

      {/* Interactive Features Section */}
      <section className="features-section" id="features">
        <div className="features-container">
          {/* Section Header */}
          <div className="features-header">
            <h2 className="features-title">
              Our <span className="features-highlight">intelligent</span>
              <br />
              features
            </h2>

            {/* Floating hashtags */}
            <div className="floating-hashtags">
              <span className="hashtag hashtag-1">#adaptive</span>
              <span className="hashtag hashtag-2">#personalized</span>
              <span className="hashtag hashtag-3">#AI-powered</span>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="landing-feature-cards">
            {/* Calibre Assessment Card */}
            <div className="landing-feature-card quiz-card">
              {/* Background decorative circles */}
              <div className="card-bg-decoration">
                <svg viewBox="0 0 96 96" className="concentric-circles">
                  <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="3" />
                  <circle cx="48" cy="48" r="36" fill="none" stroke="currentColor" strokeWidth="3" />
                  <circle cx="48" cy="48" r="28" fill="none" stroke="currentColor" strokeWidth="3" />
                  <circle cx="48" cy="48" r="20" fill="none" stroke="currentColor" strokeWidth="3" />
                  <circle cx="48" cy="48" r="12" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
              </div>

              {/* Icon with decorative circle */}
              <div className="card-icon-container">
                <div className="card-icon">
                  <div className="icon-inner">
                    <span className="question-mark">?</span>
                  </div>
                  {/* Decorative X marks */}
                  <span className="x-mark x-1">×</span>
                  <span className="x-mark x-2">×</span>
                  <span className="x-mark x-3">×</span>
                </div>
              </div>

              <div className="card-content">
                <h3 className="card-title">Learning</h3>
                <h4 className="card-subtitle">Calibre Test</h4>
                <p className="card-description">
                  AI-powered assessment that analyzes your learning patterns, speed, and accuracy to create your unique learning profile.
                </p>
              </div>
            </div>

            {/* Smart Study Pairing Card */}
            <div className="landing-feature-card activities-card">
              {/* Background decorative starburst */}
              <div className="starburst-decoration">
                <div className="starburst">
                  <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
                  </svg>
                  {/* Decorative X marks */}
                  <span className="x-mark x-1">×</span>
                  <span className="x-mark x-2">×</span>
                </div>
              </div>

              {/* Background cloud decoration */}
              <div className="cloud-decoration">
                <svg width="160" height="80" viewBox="0 0 160 80">
                  <path d="M30 50 C30 35, 40 25, 55 25 C60 20, 70 20, 75 25 C85 25, 95 35, 95 50 C100 50, 105 55, 105 60 C105 65, 100 70, 95 70 L35 70 C20 70, 15 60, 30 50 Z" fill="currentColor" />
                  <path d="M70 35 C70 25, 75 20, 85 20 C90 15, 100 15, 105 20 C115 20, 125 25, 125 35 C130 35, 135 40, 135 45 C135 50, 130 55, 125 55 L75 55 C65 55, 60 45, 70 35 Z" fill="currentColor" />
                </svg>
              </div>

              <div className="card-content">
                <h3 className="card-title">Smart Study</h3>
                <h4 className="card-subtitle">Bubbles</h4>
                <p className="card-description">
                  Get matched with compatible study partners based on your learning style, pace, and complementary strengths.
                </p>
              </div>

              {/* Bottom icon for activities card */}
              <div className="activities-bottom-icon">
                <div className="bottom-icon-circle">
                  <div className="icon-inner activities-icon-inner">
                    <div className="people-icon">
                      <div className="person person-1"></div>
                      <div className="person person-2"></div>
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <span className="floating-dot dot-1"></span>
                  <span className="floating-dot dot-2"></span>
                  <span className="floating-dot dot-3"></span>
                </div>
              </div>
            </div>

            {/* Mental Health & Wellness Card */}
            <div className="landing-feature-card games-card">
              {/* Background dots pattern */}
              <div className="dots-pattern">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div key={i} className="dot"></div>
                ))}
              </div>

              {/* Icon with decorative circle */}
              <div className="card-icon-container">
                <div className="card-icon games-icon">
                  <div className="icon-inner games-inner">
                    <div className="game-dots">
                      <div className="game-dot"></div>
                      <div className="game-dot"></div>
                    </div>
                  </div>
                  {/* Decorative X marks */}
                  <span className="x-mark x-1">×</span>
                  <span className="x-mark x-2">×</span>
                  <span className="x-mark x-3">×</span>
                </div>
              </div>

              <div className="card-content">
                <h3 className="card-title">Mental Health</h3>
                <h4 className="card-subtitle">& Wellness</h4>
                <p className="card-description">
                  Integrated stress relief tools and wellness tracking to support your mental health throughout your learning journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudAILanding;