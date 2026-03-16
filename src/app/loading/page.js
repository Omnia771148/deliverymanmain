'use client';

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Loading() {
  return (
    <div style={styles.overlay}>
      <div className="container text-center">
        {/* Logo with spinning ring */}
        <div className="brand-header mb-4">
          <div className="logo-spinner-wrapper">
            {/* Dark track ring for the white spinner to be visible on */}
            <div className="spinner-track"></div>
            {/* Spinning white arc ring */}
            <div className="spinner-ring"></div>
            {/* Charcoal circular background with logo */}
            <div className="logo-circle">
              <img
                src="/spv-logo.png"
                alt="SPV Logo"
                className="brand-logo"
              />
            </div>
          </div>
        </div>

       

        <div className="mt-4">
          <h5 className="loading-text">Wait for a Second...</h5>
          <p className="loading-subtext">Everything is getting ready for you</p>
        </div>

        <style>
          {`
            .brand-header {
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .logo-spinner-wrapper {
              position: relative;
              width: 160px;
              height: 160px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            /* The track that makes the spinner path visible */
            .spinner-track {
              position: absolute;
              width: 148px;
              height: 148px;
              border-radius: 50%;
              border: 6px solid rgba(181, 160, 112, 0.1); 
              box-sizing: border-box;
            }

            /* Spinning arc ring - Changed to Gold for visibility on white */
            .spinner-ring {
              position: absolute;
              width: 148px;
              height: 148px;
              border-radius: 50%;
              border: 6px solid transparent;
              border-top: 6px solid #B5A070; 
              animation: spinRing 1s linear infinite;
              box-sizing: border-box;
            }

            /* White circular badge behind the logo */
            .logo-circle {
              width: 120px;
              height: 120px;
              border-radius: 50%;
              background: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 10px 25px rgba(0,0,0,0.08); /* Lighter shadow for white circle */
              position: relative;
              z-index: 1;
              overflow: hidden;
            }

            .brand-logo {
              width: 110px;
              height: 110px;
              object-fit: contain;
            }

            @keyframes spinRing {
              0%   { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            .loader-track {
              width: 180px;
              height: 4px;
              background-color: #E8E2D0;
              border-radius: 20px;
              margin: 0 auto;
              overflow: hidden;
              position: relative;
            }

            .loader-glide {
              width: 40%;
              height: 100%;
              background: linear-gradient(90deg, #B5A070, #D4C08A);
              border-radius: 20px;
              position: absolute;
              animation: glideAlong 1.5s infinite ease-in-out;
            }

            @keyframes glideAlong {
              0% { left: -40%; width: 20%; }
              50% { width: 50%; }
              100% { left: 100%; width: 20%; }
            }

            .loading-text {
              font-weight: 700;
              color: #1A1A1A;
              margin-bottom: 2px;
            }

            .loading-subtext {
              color: #888;
              font-size: 0.9rem;
              font-weight: 500;
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
    backgroundColor: '#F8F5EB',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
  }
};