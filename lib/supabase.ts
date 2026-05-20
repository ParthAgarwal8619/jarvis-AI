import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Chat history will not be persisted.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export interface ConversationMessage {
  id?: string
  user_id: string
  timestamp?: string
  user_message: string
  ai_response: string
}

export async function saveConversation(
  userId: string,
  userMessage: string,
  aiResponse: string
) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('[Supabase] Skipping save - credentials not configured')
    return null
  }

  try {
    const { data, error } = await supabase.from('conversations').insert([
      {
        user_id: userId,
        user_message: userMessage,
        ai_response: aiResponse,
        timestamp: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error('Error saving conversation:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Supabase save error:', error)
    return null
  }
}

export async function getConversationHistory(userId: string, limit: number = 10) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching conversation history:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Supabase fetch error:', error)
    return []
  }
}

export async function clearConversationHistory(userId: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false
  }

  try {
    const { error } = await supabase.from('conversations').delete().eq('user_id', userId)

    if (error) {
      console.error('Error clearing conversation history:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Supabase delete error:', error)
    return false
  }
}

export async function saveUserPreferences(userId: string, preferences: Record<string, any>) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert([{ user_id: userId, preferences_json: preferences }])

    if (error) {
      console.error('Error saving preferences:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Supabase preferences error:', error)
    return null
  }
}
