import { NextRequest, NextResponse } from 'next/server'
import { searchWeb, summarizeSearchResults } from '@/lib/searchapi'

export const runtime = 'nodejs'

interface SearchRequest {
  query: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json()
    const { query } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'No query provided' }, { status: 400 })
    }

    console.log('[Search API] Searching for:', query)

    // Perform web search
    const results = await searchWeb(query)

    // Summarize results
    const summary = await summarizeSearchResults(results, query)

    return NextResponse.json({
      results,
      summary,
      count: results.length,
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
}
