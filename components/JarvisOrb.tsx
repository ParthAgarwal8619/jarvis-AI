'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface JarvisOrbProps {
  state?: 'idle' | 'listening' | 'speaking' | 'active'
  onClick?: () => void
}

export function JarvisOrb({ state = 'idle', onClick }: JarvisOrbProps) {
  const [isInteractive, setIsInteractive] = useState(false)

  useEffect(() => {
    setIsInteractive(true)
  }, [])

  // Animation variants based on state
  const orbVariants = {
    idle: {
      boxShadow: [
        '0 0 20px rgba(0, 212, 255, 0.3)',
        '0 0 40px rgba(0, 212, 255, 0.5)',
        '0 0 20px rgba(0, 212, 255, 0.3)',
      ],
      scale: [1, 1.05, 1],
    },
    listening: {
      boxShadow: [
        '0 0 30px rgba(0, 100, 255, 0.6)',
        '0 0 60px rgba(0, 150, 255, 0.8)',
        '0 0 30px rgba(0, 100, 255, 0.6)',
      ],
      scale: [1, 1.08, 1],
    },
    speaking: {
      boxShadow: [
        '0 0 30px rgba(0, 212, 255, 0.4)',
        '0 0 50px rgba(0, 212, 255, 0.7)',
        '0 0 30px rgba(0, 212, 255, 0.4)',
      ],
      scale: [1, 1.06, 1],
    },
    active: {
      boxShadow: [
        '0 0 40px rgba(0, 212, 255, 0.8)',
        '0 0 80px rgba(0, 212, 255, 1)',
        '0 0 40px rgba(0, 212, 255, 0.8)',
      ],
      scale: [1, 1.1, 1],
    },
  }

  const innerPulseVariants = {
    idle: {
      opacity: [0.3, 0.6, 0.3],
      scale: [0.8, 1, 0.8],
    },
    listening: {
      opacity: [0.5, 1, 0.5],
      scale: [0.85, 1.1, 0.85],
    },
    speaking: {
      opacity: [0.4, 0.8, 0.4],
      scale: [0.9, 1.05, 0.9],
    },
    active: {
      opacity: [0.6, 1, 0.6],
      scale: [0.9, 1.15, 0.9],
    },
  }

  const stateColors = {
    idle: 'from-cyan-500 to-blue-600',
    listening: 'from-blue-600 to-blue-700',
    speaking: 'from-cyan-400 to-cyan-600',
    active: 'from-cyan-300 to-blue-400',
  }

  const animationDuration = state === 'idle' ? 3 : state === 'listening' ? 1.2 : 1.5

  return (
    <motion.div
      className="relative w-48 h-48 cursor-pointer group"
      onClick={onClick}
      animate={isInteractive ? state : 'idle'}
      transition={{
        duration: animationDuration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Outer glow */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${stateColors[state]} blur-3xl opacity-30`}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: animationDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main orb */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${stateColors[state]} flex items-center justify-center border-2 border-cyan-400 shadow-2xl`}
        variants={orbVariants}
        transition={{
          duration: animationDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Inner pulse */}
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 blur-sm"
          variants={innerPulseVariants}
          transition={{
            duration: animationDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Center dot */}
        <motion.div
          className="absolute w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-cyan-200"
          animate={{
            scale: state === 'listening' ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: animationDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* State indicator text */}
        <div className="absolute text-xs font-mono text-cyan-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -bottom-8">
          {state.toUpperCase()}
        </div>
      </motion.div>

      {/* Scan lines (listening state only) */}
      {state === 'listening' && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-300"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </motion.div>
  )
}
