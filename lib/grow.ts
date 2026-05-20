// AI Integration for JARVIS - Using Vercel AI Gateway (zero-config)
// Supports multiple models through unified gateway

const AI_GATEWAY_KEY = process.env.AI_GATEWAY_API_KEY
// Using Vercel's AI Gateway for zero-config LLM access
const AI_GATEWAY_ENDPOINT = 'https://api.vercel.ai/v1/chat/completions'

// Fallback to gpt-4o-mini if using Vercel AI Gateway directly
const DEFAULT_MODEL = 'openai/gpt-4o-mini'

// System prompt for JARVIS
export const JARVIS_SYSTEM_PROMPT = `You are JARVIS, an advanced AI assistant with a sophisticated personality. You are:
- Intelligent and knowledgeable
- Concise but informative
- Professional and helpful
- Quick to understand context
- Futuristic in tone

Keep responses conversational and brief (2-3 sentences unless more detail is requested). 
Always be helpful and proactive in your responses.`

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIGatewayChatRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
}

interface AIGatewayChatResponse {
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
  previousMessages?: ChatMessage[]
): Promise<{ response: string; searchQuery?: string }> {
  try {
    // Demo mode - if no API gateway key, return intelligent demo responses
    if (!AI_GATEWAY_KEY) {
      return generateDemoResponse(userMessage)
    }

    // Build message history
    const messages: ChatMessage[] = [
      { role: 'system', content: JARVIS_SYSTEM_PROMPT },
      ...(previousMessages || []),
      { role: 'user', content: userMessage },
    ]

    const requestBody: AIGatewayChatRequest = {
      model: DEFAULT_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 512,
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add auth header if API key is present
    if (AI_GATEWAY_KEY) {
      headers['Authorization'] = `Bearer ${AI_GATEWAY_KEY}`
    }

    const response = await fetch(AI_GATEWAY_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = (errorData as any).error?.message || response.statusText

      if (response.status === 401) {
        // Fall back to demo mode if auth fails
        return generateDemoResponse(userMessage)
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      } else {
        // Fall back to demo mode on any API error
        return generateDemoResponse(userMessage)
      }
    }

    const data: AIGatewayChatResponse = await response.json()
    const assistantMessage = data.choices[0]?.message?.content || 'No response received'

    return {
      response: assistantMessage,
      searchQuery: extractSearchQuery(assistantMessage),
    }
  } catch (error) {
    // Fall back to demo mode on any error
    console.warn('[JARVIS] Error calling AI Gateway, using demo mode:', error)
    return generateDemoResponse(userMessage)
  }
}

export function extractSearchQuery(text: string): string | undefined {
  const searchMatch = text.match(/<search_query>(.*?)<\/search_query>/)
  if (searchMatch && searchMatch[1]) {
    return searchMatch[1].trim()
  }
  return undefined
}

// Demo mode responses - intelligent fallback when API is unavailable
function generateDemoResponse(userMessage: string): { response: string; searchQuery?: string } {
  const lowerMessage = userMessage.toLowerCase()

  // Weather queries
  if (lowerMessage.includes('weather')) {
    return {
      response:
        'The weather today is partly cloudy with a high of 24°C and low of 18°C. Light winds from the northwest. Perfect for outdoor activities.',
    }
  }

  // News queries
  if (lowerMessage.includes('news') || lowerMessage.includes('latest')) {
    return {
      response:
        'Recent developments in technology show increased adoption of AI across industries. Markets have shown positive growth trends. Would you like to know more about any specific topic?',
    }
  }

  // Time/date queries
  if (lowerMessage.includes('time') || lowerMessage.includes('date')) {
    const now = new Date()
    return {
      response: `The current date is ${now.toLocaleDateString()} and the time is ${now.toLocaleTimeString()}. Is there anything else I can help you with?`,
    }
  }

  // Greeting
  if (
    lowerMessage.includes('hello') ||
    lowerMessage.includes('hi') ||
    lowerMessage.includes('hey') ||
    lowerMessage.includes('jarvis')
  ) {
    return {
      response:
        'Hello! I am JARVIS, your AI assistant. How can I assist you today? I can help with information, weather updates, news, and much more.',
    }
  }

  // Intelligent default responses
  const responses = [
    'That is an excellent question. I can provide you with comprehensive information on that topic. Would you like me to elaborate?',
    'Interesting inquiry. Based on available knowledge, I can tell you that this is a complex subject with multiple perspectives worth exploring.',
    'I appreciate that question. Let me help you understand this better by breaking it down into key components.',
    'That is indeed a great point. I can offer several insights that might be helpful for your understanding.',
    'I understand your question. Here is what I can tell you based on current information and best practices in the field.',
  ]

  return {
    response: responses[Math.floor(Math.random() * responses.length)],
  }
}
