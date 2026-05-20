// Jarvis voice ID - using a consistent, intelligent-sounding voice
// This should be configured to match your ElevenLabs voice setup
export const JARVIS_VOICE_ID = 'BZe5a8p64FSrqTsqdlf5'
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || ''

export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + JARVIS_VOICE_ID, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()
    return buffer
  } catch (error) {
    console.error('ElevenLabs synthesis error:', error)
    throw error
  }
}

export function playAudio(audioBuffer: ArrayBuffer) {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const source = audioContext.createBufferSource()

  audioContext.decodeAudioData(
    audioBuffer,
    (buffer) => {
      source.buffer = buffer
      source.connect(audioContext.destination)
      source.start(0)
    },
    (error) => {
      console.error('Audio decode error:', error)
    }
  )
}
