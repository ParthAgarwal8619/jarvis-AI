'use client'

import { useState, useCallback, useEffect } from 'react'
import { JarvisOrb } from './JarvisOrb'
import { VoiceWave } from './VoiceWave'
import { ChatWindow } from './ChatWindow'
import { HologramPanel } from './HologramPanel'
import { SearchCard } from './SearchCard'
import { ListeningEffect } from './ListeningEffect'
import { useVoice } from '@/hooks/useVoice'
import { useConversation } from '@/hooks/useConversation'
import type { SearchResult } from '@/lib/searchapi'

type OrbState = 'idle' | 'listening' | 'speaking' | 'active'

export default function JarvisInterface() {
  const [orbState, setOrbState] = useState<OrbState>('idle')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [audioLevel, setAudioLevel] = useState(0)

  const voice = useVoice({
    onSpeakingStart: () => setOrbState('speaking'),
    onSpeakingEnd: () => setOrbState('idle'),
  })

  const conversation = useConversation()

  // Handle voice input
  const handleVoiceSubmit = useCallback(async () => {
    if (voice.transcript.trim()) {
      try {
        setOrbState('active')

        const result = await conversation.sendMessage(voice.transcript)

        setSearchResults(result.searchResults || [])

        // Synthesize speech
        try {
          const audioResponse = await fetch('/api/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: result.response }),
          })

          if (audioResponse.ok) {
            const audioBuffer = await audioResponse.arrayBuffer()
            voice.playAudio(audioBuffer)
          } else {
            console.warn('[v0] Audio synthesis failed:', audioResponse.statusText)
          }
        } catch (error) {
          console.warn('[v0] Audio synthesis error:', error)
          // Continue without audio if synthesis fails
        }

        voice.clearTranscript()
        setOrbState('idle')
      } catch (error) {
        // Error is handled by conversation hook and displayed to user
        setOrbState('idle')
      }
    }
  }, [voice, conversation])

  // Handle microphone button click
  const handleMicClick = useCallback(async () => {
    if (voice.isListening) {
      voice.stopListening()
      setOrbState('idle')

      // Wait a moment for transcription to complete
      setTimeout(() => {
        if (voice.transcript.trim()) {
          handleVoiceSubmit()
        }
      }, 500)
    } else {
      setOrbState('listening')
      voice.startListening()
    }
  }, [voice, handleVoiceSubmit])

  // Handle text input
  const handleTextSubmit = useCallback(
    async (message: string) => {
      try {
        setOrbState('active')

        const result = await conversation.sendMessage(message)
        setSearchResults(result.searchResults || [])

        // Synthesize speech
        try {
          const audioResponse = await fetch('/api/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: result.response }),
          })

          if (audioResponse.ok) {
            const audioBuffer = await audioResponse.arrayBuffer()
            voice.playAudio(audioBuffer)
          } else {
            console.warn('[v0] Audio synthesis failed:', audioResponse.statusText)
          }
        } catch (error) {
          console.warn('[v0] Audio synthesis error:', error)
          // Continue without audio if synthesis fails
        }
        
        setOrbState('idle')
      } catch (error) {
        // Error is handled by conversation hook and displayed to user
        setOrbState('idle')
      }
    },
    [conversation, voice]
  )

  // Update orb state based on voice state
  useEffect(() => {
    if (voice.isSpeaking) {
      setOrbState('speaking')
    } else if (voice.isListening) {
      setOrbState('listening')
    } else if (conversation.isLoading) {
      setOrbState('active')
    } else {
      setOrbState('idle')
    }
  }, [voice.isSpeaking, voice.isListening, conversation.isLoading])

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
            <JarvisOrb state={orbState} onClick={handleMicClick} />
            <ListeningEffect isActive={voice.isListening} />
          </div>

          {/* Voice wave visualization */}
          <VoiceWave isActive={voice.isListening || voice.isSpeaking} audioLevel={audioLevel} />

          {/* Microphone status */}
          <div className="text-center text-xs font-mono text-cyan-300 h-4">
            {voice.isListening && <span>Listening for voice input...</span>}
            {voice.isSpeaking && <span>Playing response...</span>}
            {conversation.isLoading && <span>Processing request...</span>}
            {!voice.isListening && !voice.isSpeaking && !conversation.isLoading && (
              <span className="opacity-50">Click orb or say "Hey Jarvis" to begin</span>
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
            <HologramPanel title="QUICK ACTIONS" isVisible={!voice.isListening}>
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
          <TextInputPanel onSubmit={handleTextSubmit} isLoading={conversation.isLoading} />
        </div>
      </div>

      {/* Error message */}
      {(voice.error || conversation.error) && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 p-4 rounded border border-red-500/50 bg-red-950/80 backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <span className="text-red-400 font-bold">⚠</span>
            </div>
            <div className="flex-1">
              <p className="text-red-300 text-sm font-mono leading-relaxed">{voice.error || conversation.error}</p>
              {conversation.error?.includes('quota') && (
                <p className="text-red-400/70 text-xs mt-2 font-mono">Please check your OpenAI API key and billing.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Text input component
function TextInputPanel({
  onSubmit,
  isLoading,
}: {
  onSubmit: (message: string) => void
  isLoading: boolean
}) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSubmit(input)
      setInput('')
    }
  }

  return (
    <HologramPanel title="TEXT INPUT">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask JARVIS anything..."
          disabled={isLoading}
          className="flex-1 bg-black/50 border border-cyan-400/30 rounded px-3 py-2 text-sm font-mono text-cyan-100 placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400 disabled:opacity-50 transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-900/50 text-white font-mono text-sm rounded transition-colors duration-200"
        >
          {isLoading ? 'Processing...' : 'Send'}
        </button>
      </form>
    </HologramPanel>
  )
}
