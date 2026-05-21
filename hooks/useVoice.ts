'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseVoiceOptions {
  onTranscriptChange?: (transcript: string) => void
  onError?: (error: string) => void
  onSpeakingStart?: () => void
  onSpeakingEnd?: () => void
}

export function useVoice(options?: UseVoiceOptions) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        console.log('[Voice] Recognition started')
        setIsListening(true)
        setTranscript('')
      }

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + transcriptSegment)
          } else {
            interimTranscript += transcriptSegment
          }
        }

        if (interimTranscript) {
          options?.onTranscriptChange?.(interimTranscript)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        // Don't show "not-allowed" errors as they spam the console when microphone is denied
        // Instead silently handle them
        if (event.error !== 'not-allowed') {
          console.error('[Voice] Recognition error:', event.error)
          setError(event.error)
          options?.onError?.(event.error)
        }
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        console.log('[Voice] Recognition ended')
        setIsListening(false)
      }
    }
  }, [options])

  const startListening = useCallback(async () => {
    try {
      setError(null)
      setIsListening(true)

      // Try to request microphone access, but don't fail if denied
      let stream: MediaStream | null = null
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        
        // Start recording if we got access
        const mediaRecorder = new MediaRecorder(stream)
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }

        mediaRecorder.onstart = () => {
          console.log('[Voice] Recording started')
        }

        mediaRecorderRef.current = mediaRecorder
        mediaRecorder.start()
      } catch (micError) {
        // Microphone access denied or unavailable - continue with speech recognition only
        // Silently continue - user can still type messages
      }

      // Always try to start Web Speech API recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
      } else {
        // If Speech Recognition not available, show user a message but don't error
        const msg = 'Voice input not fully available. You can still type messages.'
        setError(msg)
        options?.onError?.(msg)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Voice input unavailable'
      console.warn('[Voice] Starting listening with limited features:', errorMsg)
      // Don't fully error out - just show warning
      options?.onError?.(errorMsg)
      setIsListening(false)
    }
  }, [options])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    setIsListening(false)
  }, [])

  const playAudio = useCallback(async (audioBuffer: ArrayBuffer) => {
    try {
      const audioContext =
        audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      const source = audioContext.createBufferSource()
      options?.onSpeakingStart?.()
      setIsSpeaking(true)

      audioContext.decodeAudioData(
        audioBuffer,
        (buffer) => {
          source.buffer = buffer
          source.connect(audioContext.destination)

          source.onended = () => {
            setIsSpeaking(false)
            options?.onSpeakingEnd?.()
          }

          source.start(0)
        },
        (error) => {
          console.error('[Voice] Audio decode error:', error)
          setIsSpeaking(false)
          options?.onSpeakingEnd?.()
        }
      )
    } catch (err) {
      console.error('[Voice] Playback error:', err)
      setIsSpeaking(false)
      options?.onSpeakingEnd?.()
    }
  }, [options])

  const clearTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return {
    isListening,
    isSpeaking,
    transcript,
    error,
    startListening,
    stopListening,
    playAudio,
    clearTranscript,
  }
}
