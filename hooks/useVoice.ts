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
        console.error('[Voice] Recognition error:', event.error)
        setError(event.error)
        options?.onError?.(event.error)
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

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      if (recognitionRef.current) {
        recognitionRef.current.start()
      }

      // Also start recording for fallback
      const mediaRecorder = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstart = () => {
        console.log('[Voice] Recording started')
        setIsListening(true)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Microphone access denied'
      console.error('[Voice] Microphone error:', errorMsg)
      setError(errorMsg)
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
