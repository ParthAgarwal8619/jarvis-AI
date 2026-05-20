import { NextRequest, NextResponse } from 'next/server'
import { chatWithGrow, extractSearchQuery } from '@/lib/grow'
import { searchWeb } from '@/lib/searchapi'

export const runtime = 'nodejs'

interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[]
  userId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1]?.content || ''

    // First, get the AI response
    const { response: aiResponse, searchQuery } = await chatWithGrow(lastMessage, messages.slice(0, -1) as any)

    let finalResponse = aiResponse
    let searchResults = null
    let usedSearch = false

    // If search query is detected, perform web search
    if (searchQuery) {
      try {
        const results = await searchWeb(searchQuery)

        if (results.length > 0) {
          // Format search results for context
          const searchContext = results
            .slice(0, 3)
            .map((r) => `${r.title}\n${r.snippet}\nURL: ${r.link}`)
            .join('\n\n')

          // Get refined response with search context
          const refinedMessages = [
            ...messages,
            {
              role: 'assistant' as const,
              content: aiResponse,
            },
            {
              role: 'user' as const,
              content: `I found this additional information that might help:\n\n${searchContext}\n\nPlease provide an updated response incorporating this information if relevant.`,
            },
          ]

          const { response: refinedResponse } = await chatWithGrow(
            refinedMessages[refinedMessages.length - 1].content,
            refinedMessages.slice(0, -1) as any
          )

          finalResponse = refinedResponse
          searchResults = results
          usedSearch = true
        }
      } catch (searchError) {
        console.warn('[Chat] Search failed, continuing without search results:', searchError)
        // Continue with original response if search fails
      }
    }

    return NextResponse.json({
      response: finalResponse,
      usedSearch,
      searchResults,
    })
  } catch (error) {
    console.error('Chat API error:', error)

    let errorMessage = 'Failed to process chat request'
    let statusCode = 500

    if (error instanceof Error) {
      const errorStr = error.message.toLowerCase()

      if (errorStr.includes('quota')) {
        errorMessage = 'Grow API quota exceeded. Please check your account.'
        statusCode = 429
      } else if (errorStr.includes('invalid') && errorStr.includes('key')) {
        errorMessage = 'Invalid Grow API key. Please check your configuration.'
        statusCode = 401
      } else if (errorStr.includes('unauthorized')) {
        errorMessage = 'Grow API authentication failed. Please verify your API key.'
        statusCode = 401
      } else if (errorStr.includes('rate')) {
        errorMessage = 'Rate limit exceeded. Please try again later.'
        statusCode = 429
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
