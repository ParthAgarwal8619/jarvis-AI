'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking'

interface UseVoiceAssistantOptions {
  onTranscript?: (text: string) => void
  onResponse?: (response: string) => void
  onError?: (error: string) => void
  onStateChange?: (state: VoiceState) => void
}

export function useVoiceAssistant(options: UseVoiceAssistantOptions = {}) {
  const [state, setState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState('')

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const supported = !!SpeechRecognition && isSecure

    setIsSupported(supported)

    if (supported) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      // Handle speech recognition results
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        const fullTranscript = finalTranscript || interimTranscript
        setTranscript(fullTranscript)
        options.onTranscript?.(fullTranscript)
      }

      // Handle speech recognition start
      recognitionRef.current.onstart = () => {
        setState('listening')
        setError('')
        setTranscript('')
        options.onStateChange?.('listening')
      }

      // Handle speech recognition end
      recognitionRef.current.onend = () => {
        if (state === 'listening' && transcript) {
          setState('processing')
          options.onStateChange?.('processing')
        } else if (state === 'listening') {
          setState('idle')
          options.onStateChange?.('idle')
        }
      }

      // Handle speech recognition errors
      recognitionRef.current.onerror = (event: any) => {
        const errorMessage = getErrorMessage(event.error)
        setError(errorMessage)
        setState('idle')
        options.onStateChange?.('idle')
        options.onError?.(errorMessage)
      }
    }
  }, [options, state, transcript])

  const startListening = useCallback(() => {
    if (!isSupported) {
      const msg = 'Voice input is not supported in this browser. Please use Chrome, Edge, or another Chromium browser.'
      setError(msg)
      options.onError?.(msg)
      return
    }

    if (!recognitionRef.current) {
      const msg = 'Speech recognition not initialized'
      setError(msg)
      options.onError?.(msg)
      return
    }

    try {
      // Start speech recognition directly - no separate microphone permission needed
      recognitionRef.current.start()
    } catch (err) {
      console.error('[v0] Failed to start recognition:', err)
      const msg = 'Failed to start voice input'
      setError(msg)
      options.onError?.(msg)
    }
  }, [isSupported, options])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const playAudio = useCallback(async (audioBuffer: ArrayBuffer) => {
    try {
      setState('speaking')
      options.onStateChange?.('speaking')

      const audioContext = new (window as any).AudioContext()
      const audioData = await audioContext.decodeAudioData(audioBuffer)
      const source = audioContext.createBufferSource()
      source.buffer = audioData
      source.connect(audioContext.destination)
      source.start(0)

      // Wait for audio to finish
      await new Promise((resolve) => {
        source.onended = resolve
      })
      setState('idle')
      options.onStateChange?.('idle')
    } catch (err) {
      setState('idle')
      options.onStateChange?.('idle')
    }
  }, [options])

  const sendTranscriptToAI = useCallback(
    async (text: string) => {
      if (!text.trim()) return

      try {
        setState('processing')
        options.onStateChange?.('processing')

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: text }],
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to get AI response')
        }

        const data = await response.json()
        const aiResponse = data.response
        options.onResponse?.(aiResponse)

        // Get voice response
        const voiceResponse = await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: aiResponse }),
        })

        if (voiceResponse.ok) {
          const audioBuffer = await voiceResponse.arrayBuffer()
          await playAudio(audioBuffer)
        } else {
          setState('idle')
          options.onStateChange?.('idle')
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to process voice command'
        setError(errorMsg)
        setState('idle')
        options.onStateChange?.('idle')
        options.onError?.(errorMsg)
      }
    },
    [playAudio, options]
  )

  return {
    state,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    playAudio,
    sendTranscriptToAI,
  }
}

function getErrorMessage(error: string): string {
  const errorMap: Record<string, string> = {
    'not-allowed': 'Microphone permission denied. Please allow microphone access in browser settings.',
    'network': 'Network error. Please check your internet connection.',
    'no-speech': 'No speech detected. Please try again.',
    'audio-capture': 'No microphone found. Please connect a microphone.',
    'service-not-allowed': 'Speech recognition service not allowed.',
    'bad-grammar': 'Grammar error in speech recognition.',
    'service-not-available': 'Speech recognition service unavailable.',
  }

  return errorMap[error] || `Speech recognition error: ${error}`
}
