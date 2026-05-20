'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface VoiceWaveProps {
  isActive?: boolean
  audioLevel?: number
}

export function VoiceWave({ isActive = false, audioLevel = 0 }: VoiceWaveProps) {
  const [bars, setBars] = useState<number[]>(Array(20).fill(0.3))

  useEffect(() => {
    if (!isActive) {
      setBars(Array(20).fill(0.3))
      return
    }

    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map(() => {
          const value = Math.random()
          return Math.min(value + audioLevel / 100, 1)
        })
      )
    }, 50)

    return () => clearInterval(interval)
  }, [isActive, audioLevel])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const barVariants = {
    hidden: { height: 0 },
    visible: (i: number) => ({
      height: `${Math.max(bars[i] * 100, 10)}%`,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 60,
      },
    }),
  }

  return (
    <motion.div
      className="flex items-end justify-center gap-1 h-24 px-4"
      variants={containerVariants}
      initial="hidden"
      animate={isActive ? 'visible' : 'hidden'}
    >
      {bars.map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={barVariants}
          className="w-1 bg-gradient-to-t from-cyan-400 to-cyan-200 rounded-full shadow-lg"
          style={{
            minHeight: '4px',
          }}
        />
      ))}
    </motion.div>
  )
}
