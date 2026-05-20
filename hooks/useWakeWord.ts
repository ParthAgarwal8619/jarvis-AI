'use client'

import { useState, useCallback, useEffect } from 'react'

interface UseWakeWordOptions {
  onWakeWordDetected?: () => void
  onError?: (error: string) => void
  enabled?: boolean
}

export function useWakeWord(options?: UseWakeWordOptions) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wakeWordDetected, setWakeWordDetected] = useState(false)

  // Initialize wake word detection
  useEffect(() => {
    if (options?.enabled === false) return

    const initializeWakeWord = async () => {
      try {
        // Check if wake word service is available
        const response = await fetch('/api/wakeword', { method: 'GET' })
        const data = await response.json()

        if (data.wakeWordReady) {
          console.log('[WakeWord] Initialized with keywords:', data.keywords)
          setIsInitialized(true)
        } else {
          console.log('[WakeWord] Service not ready, using fallback detection')
          setIsInitialized(false)
        }
      } catch (err) {
        console.error('[WakeWord] Initialization error:', err)
        setError('Wake word detection not available')
        setIsInitialized(false)
      }
    }

    initializeWakeWord()
  }, [options?.enabled])

  const startWakeWordDetection = useCallback(async () => {
    if (!isInitialized) {
      console.log('[WakeWord] Not initialized, cannot start detection')
      return
    }

    try {
      setIsListening(true)
      console.log('[WakeWord] Listening for wake word...')
      // In a production environment, this would interface with Porcupine
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Wake word detection failed'
      console.error('[WakeWord] Detection error:', errorMsg)
      setError(errorMsg)
      options?.onError?.(errorMsg)
      setIsListening(false)
    }
  }, [isInitialized, options])

  const stopWakeWordDetection = useCallback(() => {
    setIsListening(false)
    console.log('[WakeWord] Stopped listening')
  }, [])

  const simulateWakeWordDetection = useCallback(() => {
    console.log('[WakeWord] Simulating wake word detection')
    setWakeWordDetected(true)
    options?.onWakeWordDetected?.()

    // Reset the flag after a moment
    setTimeout(() => setWakeWordDetected(false), 500)
  }, [options])

  return {
    isInitialized,
    isListening,
    wakeWordDetected,
    error,
    startWakeWordDetection,
    stopWakeWordDetection,
    simulateWakeWordDetection,
  }
}
