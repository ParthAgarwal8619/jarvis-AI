'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import type { SearchResult } from '@/lib/searchapi'

interface SearchCardProps {
  results: SearchResult[]
  isVisible?: boolean
}

export function SearchCard({ results, isVisible = false }: SearchCardProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <AnimatePresence>
      {isVisible && results.length > 0 && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {results.map((result, index) => (
            <motion.a
              key={`${result.link}-${index}`}
              href={result.link}
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="relative border border-cyan-400/50 rounded-lg p-3 bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors group overflow-hidden"
              style={{
                boxShadow: '0 0 15px rgba(0, 212, 255, 0.1)',
              }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-mono text-xs text-cyan-300 line-clamp-2 flex-1 group-hover:text-cyan-200 transition-colors">
                    {result.title}
                  </h3>
                  <ExternalLink className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <p className="text-xs text-cyan-100/70 line-clamp-2 mb-2 leading-tight">
                  {result.snippet}
                </p>

                <div className="text-xs text-cyan-400/60 font-mono">
                  {result.source}
                </div>
              </div>

              {/* Corner indicator */}
              <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400/50 rounded-full group-hover:bg-cyan-300 transition-colors" />
            </motion.a>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
