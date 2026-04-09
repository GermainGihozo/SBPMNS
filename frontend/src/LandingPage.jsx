import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="landing-content">
          <div className="landing-icon-wrapper">
            <span className="landing-icon">🛂</span>
          </div>
          
          <h1 className="landing-title">
            <span className="title-line">Smart Border</span>
            <span className="title-line">Passenger Management</span>
          </h1>
          
          <p className="landing-subtitle">
            Modern, secure, and efficient border control system
          </p>
          
          <div className="landing-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Real-time Tracking</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Biometric Security</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Health Monitoring</span>
            </div>
          </div>
          
          <button className="landing-cta" onClick={() => navigate('/login')}>
            Get Started
            <span className="cta-arrow">→</span>
          </button>
        </div>
        
        <div className="landing-background">
          <div className="bg-circle circle-1"></div>
          <div className="bg-circle circle-2"></div>
          <div className="bg-circle circle-3"></div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
