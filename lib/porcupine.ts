// Porcupine wake word detection setup for browser
// This manages the initialization and state of the wake word detector

export interface PorcupineConfig {
  accessKey: string
  keywords?: string[]
}

export class WakeWordDetector {
  private accessKey: string
  private keywords: string[]
  private isInitialized: boolean = false

  constructor(config: PorcupineConfig) {
    this.accessKey = config.accessKey
    this.keywords = config.keywords || ['jarvis']
  }

  async initialize(): Promise<boolean> {
    try {
      // Porcupine initialization would happen here
      // For now, we'll mock the initialization
      console.log('[Porcupine] Wake word detector initialized for keywords:', this.keywords)
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('[Porcupine] Initialization error:', error)
      return false
    }
  }

  isReady(): boolean {
    return this.isInitialized
  }

  getKeywords(): string[] {
    return this.keywords
  }

  async processAudio(audioFrame: Int16Array): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('Porcupine not initialized')
    }

    // Mock detection - in production, this would call the actual Porcupine library
    // Return -1 if no keyword detected, or index of detected keyword
    return -1
  }

  terminate(): void {
    this.isInitialized = false
  }
}

export function createWakeWordDetector(accessKey: string): WakeWordDetector {
  return new WakeWordDetector({
    accessKey,
    keywords: ['jarvis'],
  })
}
