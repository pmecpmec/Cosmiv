/**
 * Astronaut Loading Screen
 * Space-themed loading animation with floating astronaut
 */

import { motion } from 'framer-motion'
import '../styles/astronaut-loader.css'

export default function AstronautLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-pure-black flex items-center justify-center z-50">
      <div className="space-loader">
        {/* Stars Container */}
        <div className="stars-container">
          <div 
            className="stars stars-near" 
            style={{ '--star-x': '20%', '--star-y': '30%' }}
          ></div>
          <div 
            className="stars stars-mid" 
            style={{ '--star-x': '60%', '--star-y': '50%' }}
          ></div>
          <div 
            className="stars stars-far" 
            style={{ '--star-x': '80%', '--star-y': '20%' }}
          ></div>
        </div>

        {/* Meteors */}
        <div className="meteors">
          <div className="meteor meteor-1"></div>
          <div className="meteor meteor-2"></div>
          <div className="meteor meteor-3"></div>
        </div>

        {/* Astronaut */}
        <div className="astronaut">
          {/* Helmet */}
          <div className="astronaut-helmet">
            <div className="helmet-glass">
              <div className="helmet-inner-glass"></div>
              <div className="helmet-reflection"></div>
            </div>
          </div>

          {/* Antenna */}
          <div className="antenna"></div>

          {/* Body */}
          <div className="astronaut-body">
            <div className="suit-pattern"></div>
          </div>
        </div>

        {/* Loading Container */}
        <div className="loading-container">
          <div className="loading-progress">
            <div className="progress-bar"></div>
          </div>
          <div className="loading-text">L O A D I N G . . .</div>
        </div>
      </div>
    </div>
  )
}

