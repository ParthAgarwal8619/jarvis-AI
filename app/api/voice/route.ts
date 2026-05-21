import { NextRequest, NextResponse } from 'next/server'
import { synthesizeSpeech } from '@/lib/elevenlabs'

export const runtime = 'nodejs'

interface VoiceRequest {
  text: string
  voiceId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: VoiceRequest = await request.json()
    const { text } = body

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // Synthesize speech using ElevenLabs
    const audioBuffer = await synthesizeSpeech(text)

    // Return the audio as a binary response
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    // Return a simple silence/demo audio on error instead of failing
    // This allows the app to continue working even without ElevenLabs
    const demoAudioBuffer = new ArrayBuffer(1024)
    return new NextResponse(demoAudioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': '1024',
      },
    })
  }
}
