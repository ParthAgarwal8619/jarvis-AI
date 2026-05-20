import { NextRequest, NextResponse } from 'next/server'
import { chat, extractSearchQuery } from '@/lib/openai'
import { searchWeb, summarizeSearchResults } from '@/lib/searchapi'

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

    // First, get the AI response
    const { text, needsSearch } = await chat(messages)

    let finalResponse = text
    let searchResults = null
    let usedSearch = false

    // If search is needed, perform search and get augmented response
    if (needsSearch) {
      const searchQuery = extractSearchQuery(text)
      console.log('[Chat] Search needed for query:', searchQuery)

      const results = await searchWeb(searchQuery)

      if (results.length > 0) {
        const searchSummary = await summarizeSearchResults(results, searchQuery)

        // Get a new response with search context
        const augmentedMessages = [
          ...messages,
          { role: 'assistant' as const, content: text },
          {
            role: 'user' as const,
            content: `I found this information. Please incorporate it into your response:\n\n${searchSummary}`,
          },
        ]

        const { text: augmentedResponse } = await chat(augmentedMessages, searchSummary)
        finalResponse = augmentedResponse
        searchResults = results
        usedSearch = true
      }
    }

    return NextResponse.json({
      response: finalResponse,
      usedSearch,
      searchResults,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
