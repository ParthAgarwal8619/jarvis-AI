'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface HologramPanelProps {
  children: ReactNode
  isVisible?: boolean
  title?: string
}

export function HologramPanel({ children, isVisible = true, title }: HologramPanelProps) {
  const panelVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  const scanlineVariants = {
    initial: {
      y: -100,
      opacity: 0,
    },
    animate: {
      y: '100%',
      opacity: [0, 0.3, 0],
      transition: {
        duration: 1.5,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <motion.div
      className="relative border-2 border-cyan-400 rounded-lg p-4 bg-black/40 backdrop-blur-sm overflow-hidden shadow-lg"
      variants={panelVariants}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      style={{
        boxShadow: '0 0 20px rgba(0, 212, 255, 0.2), inset 0 0 20px rgba(0, 212, 255, 0.1)',
      }}
    >
      {/* Scan line effect */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-cyan-400 to-transparent"
        variants={scanlineVariants}
        initial="initial"
        animate="animate"
        transition={{
          repeatDelay: 1,
          repeat: Infinity,
        }}
      />

      {/* Corner glows */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-md" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-md" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-md" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-md" />

      {/* Title bar */}
      {title && (
        <div className="mb-3 pb-2 border-b border-cyan-400/30 text-xs font-mono text-cyan-300 uppercase tracking-wider">
          {title}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
