// Jarvis voice ID - using a consistent, intelligent-sounding voice
export const JARVIS_VOICE_ID = 'BZe5a8p64FSrqTsqdlf5'
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || ''

// Generate a simple beep sound as demo audio (when API key is unavailable)
function generateDemoAudio(): ArrayBuffer {
  const audioContext = new (typeof window !== 'undefined' ? window.AudioContext : (global as any).AudioContext)()
  const sampleRate = audioContext.sampleRate
  const duration = 0.5
  const frequency = 800
  const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate)
  const channelData = buffer.getChannelData(0)

  for (let i = 0; i < buffer.length; i++) {
    channelData[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 0.3
  }

  // Convert to WAV format
  const wav = audioBufferToWav(buffer)
  return wav
}

// Convert AudioBuffer to WAV format
function audioBufferToWav(audioBuffer: AudioBuffer): ArrayBuffer {
  const numberOfChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16

  const bytesPerSample = bitDepth / 8
  const blockAlign = numberOfChannels * bytesPerSample

  const channelData = []
  for (let i = 0; i < numberOfChannels; i++) {
    channelData.push(audioBuffer.getChannelData(i))
  }

  const interleaved = new Float32Array(audioBuffer.length * numberOfChannels)
  let offset = 0
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let ch = 0; ch < numberOfChannels; ch++) {
      interleaved[offset++] = channelData[ch][i]
    }
  }

  const dataLength = audioBuffer.length * numberOfChannels * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataLength)
  const view = new DataView(buffer)

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numberOfChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeString(36, 'data')
  view.setUint32(40, dataLength, true)

  let index = 44
  const volume = 0.8
  for (let i = 0; i < interleaved.length; i++) {
    view.setInt16(index, interleaved[i] < 0 ? interleaved[i] * 0x8000 : interleaved[i] * 0x7fff, true)
    index += 2
  }

  return buffer
}

export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  // If no API key, return demo audio
  if (!ELEVENLABS_API_KEY) {
    console.log('[Voice] Using demo audio synthesis (no API key configured)')
    // Return a simple silence buffer that won't cause errors
    const audioContext = new (typeof window !== 'undefined' ? window.AudioContext : (global as any).AudioContext)()
    const duration = 0.1
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate)
    return buffer.getChannelData(0).buffer
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
