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

    console.log('[Voice API] Synthesizing speech for text:', text.substring(0, 50) + '...')

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
    console.error('Voice API error:', error)
    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    )
  }
}
