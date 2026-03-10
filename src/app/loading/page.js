'use client';

import React from 'react';

import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export default function Loading() {
  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.orangeDot}></div>
          <h1 className={outfit.className} style={styles.leevonText}>LEEVON</h1>
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
    backgroundColor: '#f7f7eb',
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
    gap: '12px',
    marginBottom: '20px',
  },
  orangeDot: {
    width: '10px',
    height: '10px',
    backgroundColor: '#FF6B00',
    borderRadius: '50%',
    marginTop: '4px',
  },
  leevonText: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111',
    margin: 0,
    letterSpacing: '5px',
    textTransform: 'uppercase',
  },
  progressContainer: {
    width: '75%',
    margin: '0 auto 15px auto',
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
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px'
  },
  mainText: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1A1A1A',
    margin: 0,
    letterSpacing: '-0.2px'
  },
  subText: {
    fontSize: '11px',
    color: '#9E9B96',
    fontWeight: '500',
    margin: 0,
  }
};