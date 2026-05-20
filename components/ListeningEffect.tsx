'use client'

import { motion } from 'framer-motion'

interface ListeningEffectProps {
  isActive?: boolean
}

export function ListeningEffect({ isActive = false }: ListeningEffectProps) {
  const pulseVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: [1, 2.5],
      opacity: [0.8, 0],
      transition: {
        delay: i * 0.15,
        duration: 1.2,
        repeat: Infinity,
        ease: 'easeOut',
      },
    }),
  }

  const scannerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  }

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      style={{ pointerEvents: 'none' }}
    >
      {/* Expanding pulses */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`pulse-${i}`}
          className="absolute rounded-full border-2 border-cyan-400/50"
          style={{
            width: '200px',
            height: '200px',
          }}
          custom={i}
          variants={pulseVariants}
          initial="hidden"
          animate={isActive ? 'visible' : 'hidden'}
        />
      ))}

      {/* Rotating scanner rings */}
      <motion.div
        className="absolute rounded-full border-2 border-transparent border-r-cyan-400 border-t-cyan-300"
        style={{
          width: '250px',
          height: '250px',
        }}
        variants={scannerVariants}
        animate={isActive ? 'animate' : { rotate: 0 }}
      />

      {/* Radar dots */}
      <motion.div className="absolute w-2 h-2 bg-cyan-400 rounded-full" style={{ top: '25%', left: '50%' }} />
      <motion.div className="absolute w-2 h-2 bg-cyan-400 rounded-full" style={{ top: '50%', right: '25%' }} />
      <motion.div className="absolute w-2 h-2 bg-cyan-400 rounded-full" style={{ bottom: '25%', left: '50%' }} />
      <motion.div className="absolute w-2 h-2 bg-cyan-400 rounded-full" style={{ top: '50%', left: '25%' }} />

      {/* Scanning beam */}
      <motion.div
        className="absolute w-1 h-32 bg-gradient-to-b from-cyan-400 to-transparent blur-sm"
        animate={
          isActive
            ? {
                rotate: 360,
              }
            : { rotate: 0 }
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          transformOrigin: 'center 200px',
        }}
      />
    </motion.div>
  )
}
