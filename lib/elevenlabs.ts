// Jarvis voice ID - using a consistent, intelligent-sounding voice
export const JARVIS_VOICE_ID = 'BZe5a8p64FSrqTsqdlf5'
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || ''

// Generate a minimal WAV file with silence as demo audio (works on server)
function generateDemoAudio(): ArrayBuffer {
  const sampleRate = 24000
  const duration = 0.5 // 500ms
  const numSamples = Math.floor(sampleRate * duration)
  const channels = 1
  const bitsPerSample = 16

  // WAV file header
  const header = new ArrayBuffer(44)
  const headerView = new DataView(header)
  const audioData = new Uint8Array(numSamples * channels * (bitsPerSample / 8))

  // Fill audio data with silence (zeros)
  audioData.fill(0)

  // Write WAV header
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  const subchunk2Size = numSamples * channels * (bitsPerSample / 8)
  const subchunk1Size = 16
  const chunkSize = 36 + subchunk2Size

  writeString(headerView, 0, 'RIFF')
  headerView.setUint32(4, chunkSize, true)
  writeString(headerView, 8, 'WAVE')
  writeString(headerView, 12, 'fmt ')
  headerView.setUint32(16, subchunk1Size, true)
  headerView.setUint16(20, 1, true) // PCM format
  headerView.setUint16(22, channels, true)
  headerView.setUint32(24, sampleRate, true)
  headerView.setUint32(28, sampleRate * channels * (bitsPerSample / 8), true)
  headerView.setUint16(32, channels * (bitsPerSample / 8), true)
  headerView.setUint16(34, bitsPerSample, true)
  writeString(headerView, 36, 'data')
  headerView.setUint32(40, subchunk2Size, true)

  // Combine header and audio data
  const wavFile = new Uint8Array(header.byteLength + audioData.length)
  wavFile.set(new Uint8Array(header), 0)
  wavFile.set(audioData, header.byteLength)

  return wavFile.buffer
}

export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  // If no API key, return demo audio
  if (!ELEVENLABS_API_KEY) {
    return generateDemoAudio()
  }

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
      console.warn(`[Voice] ElevenLabs API returned ${response.status}, using demo audio`)
      // Fallback to demo audio on API error
      return generateDemoAudio()
    }

    const buffer = await response.arrayBuffer()
    return buffer
  } catch (error) {
    console.warn('[Voice] ElevenLabs synthesis error, using demo audio:', error)
    // Fallback to demo audio on network error
    return generateDemoAudio()
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
