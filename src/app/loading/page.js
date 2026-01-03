'use client';

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Loading() {
  return (
    <div style={styles.overlay}>
      <div className="text-center">
        {/* Pizza Icon Container */}
        <div className="pizza-box">
          <span style={styles.pizzaEmoji}>🍕</span>
        </div>
        
        {/* Scrolling Text Animation */}
        <div className="mt-4">
          <h5 className="scrolling-text">Preparing Your Menu...</h5>
          <div className="progress mt-3" style={{ height: '6px', width: '220px', margin: '0 auto', borderRadius: '10px' }}>
            <div 
              className="progress-bar progress-bar-striped progress-bar-animated bg-warning" 
              role="progressbar" 
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>

        {/* This block injects the actual animation logic into the browser */}
        <style>
          {`
            .pizza-box {
              font-size: 80px;
              display: inline-block;
              animation: spinPizza 2s linear infinite;
            }

            .scrolling-text {
              color: #ffc107;
              font-weight: bold;
              letter-spacing: 1px;
              animation: pulseText 1.5s ease-in-out infinite;
            }

            @keyframes spinPizza {
              0% { transform: rotate(0deg) scale(1); }
              50% { transform: rotate(180deg) scale(1.3); }
              100% { transform: rotate(360deg) scale(1); }
            }

            @keyframes pulseText {
              0% { opacity: 0.5; transform: translateY(0px); }
              50% { opacity: 1; transform: translateY(-5px); }
              100% { opacity: 0.5; transform: translateY(0px); }
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
    backgroundColor: '#ffffff',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  pizzaEmoji: {
    display: 'block',
    filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.2))',
    userSelect: 'none'
  }
};