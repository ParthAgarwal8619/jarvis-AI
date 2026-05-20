'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { HologramPanel } from './HologramPanel'
import type { Message } from '@/hooks/useConversation'

interface ChatWindowProps {
  messages: Message[]
  isLoading?: boolean
  maxHeight?: string
}

export function ChatWindow({ messages, isLoading = false, maxHeight = 'max-h-96' }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  }

  return (
    <HologramPanel title="CONVERSATION LOG" isVisible={messages.length > 0 || isLoading}>
      <div ref={scrollRef} className={`${maxHeight} overflow-y-auto space-y-3 pr-2 custom-scrollbar`}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`text-sm font-mono rounded px-3 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-900/30 border border-blue-400/50 text-blue-200'
                  : 'bg-cyan-900/20 border border-cyan-400/50 text-cyan-100'
              }`}
            >
              <div className="text-xs opacity-50 mb-1">
                {message.role === 'user' ? '> USER' : '< JARVIS'}
              </div>
              <div className="break-words">{message.content}</div>

              {/* Search results indicator */}
              {message.searchResults && message.searchResults.length > 0 && (
                <div className="mt-2 text-xs opacity-70 text-cyan-300">
                  📊 {message.searchResults.length} search results used
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-mono text-cyan-300 flex items-center gap-2"
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-block w-1 h-1 rounded-full bg-cyan-400"
            />
            Processing...
          </motion.div>
        )}

        {/* Empty state */}
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-cyan-400/50 text-xs italic py-4">
            Awaiting input...
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 100, 150, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.8);
        }
      `}</style>
    </HologramPanel>
  )
}
