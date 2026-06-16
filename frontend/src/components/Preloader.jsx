import React, { useState, useEffect } from 'react';

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [status, setStatus] = useState('Selecting ingredients...');

  useEffect(() => {
    const duration = 1000; // 1 second loader
    const intervalTime = 25;
    const steps = duration / intervalTime;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const percent = Math.min(100, Math.round((step / steps) * 100));
      setProgress(percent);

      if (percent < 30) {
        setStatus('Selecting ingredients...');
      } else if (percent < 60) {
        setStatus('Grading almonds & pistachios...');
      } else if (percent < 85) {
        setStatus('Roasting with care...');
      } else {
        setStatus('Polishing gold accents...');
      }

      if (step >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          setVisible(false);
        }, 400);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  return (
    <div 
      id="preloader" 
      style={{
        opacity: progress === 100 ? 0 : 1,
        visibility: progress === 100 ? 'hidden' : 'visible',
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.8s'
      }}
    >
      <div className="preloader-content">
        <img src="images/logo.png" alt="Rein Oro Foods Logo" className="preloader-logo-img" />
        <div className="preloader-subtitle">CRAFTED FOR THE DISCERNING</div>
        <div className="preloader-bar-container">
          <div className="preloader-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="preloader-percentage">{progress}%</div>
        <div className="preloader-status">{status}</div>
      </div>
    </div>
  );
}
