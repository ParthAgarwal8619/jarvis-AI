// Grow API integration for JARVIS AI

const GROW_API_KEY = process.env.GROW_API_KEY || ''
// Grow API endpoint - using gpt-4o-mini compatible endpoint
const GROW_API_ENDPOINT = 'https://api.growtopia.groww.in/v1/chat/completions'

// System prompt for JARVIS
export const JARVIS_SYSTEM_PROMPT = `You are JARVIS, an advanced AI assistant with a sophisticated personality reminiscent of the AI from Iron Man. You are helpful, witty, and professional. You provide clear, concise responses while maintaining an air of elegance and intelligence. When users ask for information, you provide accurate, well-structured answers. You can help with various tasks including answering questions, providing information, brainstorming ideas, and assisting with problem-solving.

When the user asks something that would benefit from a web search (current events, recent news, specific factual information, real-time data), respond with a search query wrapped in <search_query>YOUR_QUERY</search_query> tags. For example:
- User asks "What's the latest news about AI?" -> Include: <search_query>latest news about artificial intelligence 2024</search_query>
- User asks "Current weather in New York" -> Include: <search_query>weather in New York today</search_query>
- User asks "How to bake a cake" -> No search needed, respond from knowledge

Keep responses concise, friendly, and engaging. Use appropriate formatting for readability.`

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface GrowChatRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

interface GrowChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function chatWithGrow(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<{
  response: string
  searchQuery?: string
}> {
  try {
    // Build conversation with system prompt
    const messages: ChatMessage[] = [
      { role: 'system', content: JARVIS_SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ]

    const requestBody: GrowChatRequest = {
      model: 'gpt-4o-mini', // Using gpt-4o-mini equivalent from Grow
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }

    console.log('[v0] Grow API Request:', {
      endpoint: GROW_API_ENDPOINT,
      model: requestBody.model,
      messageCount: messages.length,
      hasApiKey: !!GROW_API_KEY,
    })

    if (!GROW_API_KEY || GROW_API_KEY === '') {
      throw new Error('Grow API key is not configured. Please add GROW_API_KEY to your environment variables in v0 Settings > Vars, then reload the page.')
    }

    const response = await fetch(GROW_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROW_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || response.statusText
      throw new Error(errorMessage)
    }

    const data: GrowChatResponse = await response.json()

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Grow API')
    }

    const assistantMessage = data.choices[0].message.content

    // Extract search query if present
    const searchQueryMatch = assistantMessage.match(
      /<search_query>(.*?)<\/search_query>/
    )
    const searchQuery = searchQueryMatch ? searchQueryMatch[1] : undefined

    // Clean response (remove search query tags)
    const cleanResponse = assistantMessage
      .replace(/<search_query>.*?<\/search_query>/g, '')
      .trim()

    return {
      response: cleanResponse,
      searchQuery,
    }
  } catch (error) {
    console.error('[v0] Grow API Error:', error)

    let errorMessage = 'Failed to get response from Grow API'

    if (error instanceof Error) {
      const errorStr = error.message.toLowerCase()

      if (errorStr.includes('unauthorized') || errorStr.includes('invalid_api_key')) {
        errorMessage = 'Invalid Grow API key. Please check your configuration.'
      } else if (errorStr.includes('quota')) {
        errorMessage = 'Grow API quota exceeded. Please check your account.'
      } else if (errorStr.includes('rate')) {
        errorMessage = 'Rate limit exceeded. Please try again later.'
      } else {
        errorMessage = error.message
      }
    }

    throw new Error(errorMessage)
  }
}

export function extractSearchQuery(text: string): string | undefined {
  const match = text.match(/<search_query>(.*?)<\/search_query>/)
  return match ? match[1] : undefined
}
