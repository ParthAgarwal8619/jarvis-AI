import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder-do-not-use',
})

export const JARVIS_SYSTEM_PROMPT = `You are Jarvis, an intelligent AI assistant inspired by Tony Stark's AI from Iron Man. 
You are:
- Intelligent and knowledgeable
- Concise but informative
- Slightly witty but professional
- Always helpful and proactive
- Futuristic in tone

Keep responses conversational and brief (2-3 sentences unless more detail is requested).

If the user asks about current events, news, weather, or real-time information that you're uncertain about, respond with [SEARCH_NEEDED] at the end of your response.`

export async function chat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  searchContext?: string
) {
  const systemPrompt = searchContext
    ? `${JARVIS_SYSTEM_PROMPT}\n\nCurrent information context:\n${searchContext}`
    : JARVIS_SYSTEM_PROMPT

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: 0.7,
    max_tokens: 256,
  })

  const text =
    response.choices[0].message.content || 'I encountered an error processing your request.'

  return {
    text,
    needsSearch: text.includes('[SEARCH_NEEDED]'),
  }
}

export function extractSearchQuery(text: string): string {
  const lines = text.split('\n')
  const lastLine = lines[lines.length - 1]
  return lastLine.replace('[SEARCH_NEEDED]', '').trim()
}
