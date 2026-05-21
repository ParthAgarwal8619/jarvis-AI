'use client'

import { useState, useRef, useCallback } from 'react'

interface UseVoiceOptions {
  onTranscriptChange?: (transcript: string) => void
  onError?: (error: string) => void
}

export function useVoice(options?: UseVoiceOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Play audio response
  const playAudio = useCallback(async (audioBuffer: ArrayBuffer) => {
    try {
      setError(null)
      setIsSpeaking(true)

      // Convert buffer to blob and play
      const blob = new Blob([audioBuffer], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)

      // Create audio element if not exists
      if (!audioRef.current) {
        audioRef.current = new Audio()
      }

      const audio = audioRef.current
      audio.src = url
      
      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(url)
      }

      audio.onerror = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(url)
        // Silently fail - voice is optional
      }

      await audio.play().catch(() => {
        setIsSpeaking(false)
        // Silently fail
      })
    } catch (err) {
      setIsSpeaking(false)
      // Silently fail - voice is optional
    }
  }, [])

  const stopListening = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsSpeaking(false)
  }, [])

  const clearTranscript = useCallback(() => {
    // No-op since we removed speech recognition
  }, [])

  return {
    isListening: false,
    isSpeaking,
    transcript: '',
    error,
    startListening: () => {
      // No-op - speech recognition not supported
    },
    stopListening,
    playAudio,
    clearTranscript,
  }
}
