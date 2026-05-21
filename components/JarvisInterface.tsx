'use client'

import { useState, useCallback, useEffect } from 'react'
import { JarvisOrb } from './JarvisOrb'
import { VoiceWave } from './VoiceWave'
import { ChatWindow } from './ChatWindow'
import { HologramPanel } from './HologramPanel'
import { SearchCard } from './SearchCard'
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant'
import { useConversation } from '@/hooks/useConversation'
import type { SearchResult } from '@/lib/searchapi'

type OrbState = 'idle' | 'listening' | 'processing' | 'speaking' | 'active'

export default function JarvisInterface() {
  const [orbState, setOrbState] = useState<OrbState>('idle')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [textInput, setTextInput] = useState('')
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const voiceAssistant = useVoiceAssistant({
    onStateChange: (state) => setOrbState(state),
    onError: (error) => {
      setErrorMessage(error)
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    },
    onTranscript: (text) => setTextInput(text),
    onResponse: (response) => {
      conversation.addMessage({ role: 'assistant', content: response })
    },
  })

  const conversation = useConversation()

  // Handle text input submission
  const handleTextSubmit = useCallback(
    async (message?: string) => {
      const msg = message || textInput.trim()
      if (!msg) return

      try {
        setOrbState('processing')
        setTextInput('')

        const result = await conversation.sendMessage(msg)
        setSearchResults(result.searchResults || [])

        // Synthesize and play speech
        try {
          const audioResponse = await fetch('/api/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: result.response }),
          })

          if (audioResponse.ok) {
            setOrbState('speaking')
            const audioBuffer = await audioResponse.arrayBuffer()
            await voiceAssistant.playAudio(audioBuffer)
          }
        } catch (error) {
          console.error('[v0] Voice synthesis error:', error)
        }

        setOrbState('idle')
      } catch (error) {
        console.error('[v0] Text submission error:', error)
        setErrorMessage(error instanceof Error ? error.message : 'Failed to process message')
        setShowError(true)
        setOrbState('idle')
      }
    },
    [conversation, voiceAssistant, textInput]
  )

  // Handle orb click for voice input
  const handleOrbClick = useCallback(() => {
    if (voiceAssistant.state === 'idle' && voiceAssistant.isSupported) {
      voiceAssistant.startListening()
    } else if (voiceAssistant.state === 'listening') {
      voiceAssistant.stopListening()
      // Auto-send transcript when done listening
      if (voiceAssistant.transcript.trim()) {
        voiceAssistant.sendTranscriptToAI(voiceAssistant.transcript)
      }
    }
  }, [voiceAssistant])

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center gap-8 p-4">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-transparent" />
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="cyan" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-bold font-mono tracking-widest mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            JARVIS
          </h1>
          <p className="text-cyan-400/70 text-sm font-mono tracking-wider">A.I. INTERFACE INITIALIZED</p>
        </div>

        {/* Central orb section */}
        <div className="relative flex flex-col items-center gap-6">
          <div className="relative">
            <JarvisOrb state={orbState} onClick={handleOrbClick} />
          </div>

          {/* Voice wave visualization */}
          <VoiceWave isActive={orbState === 'listening' || orbState === 'speaking'} audioLevel={orbState === 'listening' ? 70 : orbState === 'speaking' ? 50 : 0} />

          {/* Status text */}
          <div className="text-center text-xs font-mono text-cyan-300 h-4">
            {orbState === 'listening' && <span>Listening...</span>}
            {orbState === 'processing' && <span>Processing...</span>}
            {orbState === 'speaking' && <span>Speaking...</span>}
            {orbState === 'idle' && voiceAssistant.isSupported && (
              <span className="opacity-50 cursor-pointer hover:opacity-100">Click orb to speak or type a message</span>
            )}
            {!voiceAssistant.isSupported && (
              <span className="text-amber-400/70">Voice input unavailable - Use text input</span>
            )}
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
          {/* Chat window - left column */}
          <div className="lg:col-span-2">
            <ChatWindow messages={conversation.messages} isLoading={conversation.isLoading} />
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            {/* Search results */}
            {searchResults.length > 0 && (
              <HologramPanel title="SEARCH RESULTS" isVisible={searchResults.length > 0}>
                <SearchCard results={searchResults} isVisible={searchResults.length > 0} />
              </HologramPanel>
            )}

            {/* Quick actions */}
            <HologramPanel title="QUICK ACTIONS" isVisible={true}>
              <div className="space-y-2">
                <button
                  onClick={() => handleTextSubmit("What's the current weather?")}
                  className="w-full text-xs font-mono px-3 py-2 rounded border border-cyan-400/50 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-300 hover:text-cyan-100 transition-colors"
                >
                  Weather Report
                </button>
                <button
                  onClick={() => handleTextSubmit("Tell me the latest news")}
                  className="w-full text-xs font-mono px-3 py-2 rounded border border-cyan-400/50 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-300 hover:text-cyan-100 transition-colors"
                >
                  News Update
                </button>
                <button
                  onClick={() => {
                    conversation.clearHistory()
                    setSearchResults([])
                  }}
                  className="w-full text-xs font-mono px-3 py-2 rounded border border-red-400/50 bg-red-900/20 hover:bg-red-900/40 text-red-300 hover:text-red-100 transition-colors"
                >
                  Clear History
                </button>
              </div>
            </HologramPanel>
          </div>
        </div>

        {/* Text input area */}
        <div className="w-full max-w-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 font-mono text-sm rounded border border-cyan-400/50 bg-slate-900/50 text-cyan-100 placeholder-cyan-600 focus:outline-none focus:border-cyan-300 focus:bg-slate-900/80 transition-colors"
              disabled={conversation.isLoading}
            />
            <button
              onClick={() => handleTextSubmit()}
              disabled={conversation.isLoading || !textInput.trim()}
              className="px-6 py-2 font-mono text-sm rounded border border-cyan-400/50 bg-cyan-900/40 hover:bg-cyan-900/60 disabled:opacity-50 disabled:cursor-not-allowed text-cyan-300 hover:text-cyan-100 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {(showError || conversation.error) && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 p-4 rounded border border-red-500/50 bg-red-950/80 backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <span className="text-red-400 font-bold">⚠</span>
            </div>
            <div className="flex-1">
              <p className="text-red-300 text-sm font-mono leading-relaxed">{errorMessage || conversation.error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
