'use client';

import React from 'react';

export default function Loading() {
  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.orangeDot}></div>
          <h1 style={styles.spvText}>SPV</h1>
        </div>
        
        {/* Progress Bar */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBase}>
            <div className="progress-fill" style={styles.progressFill}></div>
          </div>
        </div>

        {/* Text Section */}
        <div style={styles.textSection}>
          <h2 style={styles.mainText}>Wait for a Second...</h2>
          <p style={styles.subText}>Everything is getting ready for you</p>
        </div>

        <style>
          {`
            @keyframes progressMove {
              0% { left: -20%; width: 20%; }
              50% { left: 40%; width: 30%; }
              100% { left: 100%; width: 20%; }
            }
            .progress-fill {
              animation: progressMove 2.5s infinite ease-in-out;
            }
          `}
        </style>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F7F2',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
    maxWidth: '240px',
    padding: '0 20px',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '25px',
  },
  orangeDot: {
    width: '12px',
    height: '12px',
    backgroundColor: '#FF6B00',
    borderRadius: '50%',
  },
  spvText: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
    letterSpacing: '4px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  progressContainer: {
    width: '80%',
    margin: '0 auto 20px auto',
  },
  progressBase: {
    height: '4px',
    width: '100%',
    backgroundColor: '#EEEBE3',
    borderRadius: '10px',
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#FF6B00',
    borderRadius: '10px',
    width: '20%',
    left: '0',
  },
  textSection: {
    marginTop: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Added for perfect centering
    justifyContent: 'center',
    gap: '2px'
  },
  mainText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1A1A1A',
    margin: 0,
    letterSpacing: '-0.2px'
  },
  subText: {
    fontSize: '12px',
    color: '#9E9B96',
    fontWeight: '500',
    margin: 0,
  }
};