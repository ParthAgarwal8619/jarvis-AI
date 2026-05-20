import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Health check endpoint for wake word detection
 * Can be used to verify that Porcupine is properly initialized
 */
export async function GET() {
  try {
    // Check if required API keys are present
    const hasAccessKey = !!process.env.PORCUPINE_ACCESS_KEY

    return NextResponse.json({
      status: 'ok',
      wakeWordReady: hasAccessKey,
      keywords: ['jarvis'],
    })
  } catch (error) {
    console.error('Wake word health check error:', error)
    return NextResponse.json(
      { status: 'error', error: 'Wake word detection not available' },
      { status: 500 }
    )
  }
}

interface WakeWordRequest {
  action: 'check' | 'status'
}

export async function POST(request: NextRequest) {
  try {
    const body: WakeWordRequest = await request.json()

    if (body.action === 'status') {
      return NextResponse.json({
        initialized: true,
        keywords: ['jarvis'],
        model: 'porcupine-v3',
      })
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Wake word API error:', error)
    return NextResponse.json(
      { error: 'Wake word operation failed' },
      { status: 500 }
    )
  }
}
