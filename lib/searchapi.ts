export interface SearchResult {
  title: string
  link: string
  snippet: string
  source: string
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      api_key: process.env.SEARCHAPI_API_KEY || '',
      engine: 'google',
    })

    const response = await fetch(`https://www.searchapi.io/api/v1/search?${params}`, {
      method: 'GET',
    })

    if (!response.ok) {
      console.error('SearchAPI error:', response.statusText)
      return []
    }

    const data = await response.json()
    const results: SearchResult[] = []

    // Extract organic search results
    if (data.organic_results) {
      for (const result of data.organic_results.slice(0, 5)) {
        results.push({
          title: result.title,
          link: result.link,
          snippet: result.snippet,
          source: new URL(result.link).hostname,
        })
      }
    }

    return results
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}

export async function summarizeSearchResults(
  results: SearchResult[],
  query: string
): Promise<string> {
  if (results.length === 0) {
    return `No search results found for "${query}".`
  }

  const summaryText = results
    .slice(0, 3)
    .map((r, i) => `${i + 1}. ${r.title}: ${r.snippet}`)
    .join('\n\n')

  return `Found information about "${query}":\n\n${summaryText}`
}
