'use client'

import { useState, useCallback, useRef } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  searchResults?: any[]
}

interface UseConversationOptions {
  onMessageAdded?: (message: Message) => void
  onError?: (error: string) => void
}

export function useConversation(options?: UseConversationOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchMode, setSearchMode] = useState(false)

  const messageIdRef = useRef(0)

  const addMessage = useCallback(
    (role: 'user' | 'assistant', content: string, searchResults?: any[]) => {
      const id = `msg-${messageIdRef.current++}`
      const message: Message = {
        id,
        role,
        content,
        timestamp: Date.now(),
        searchResults,
      }

      setMessages((prev) => [...prev, message])
      options?.onMessageAdded?.(message)

      return message
    },
    [options]
  )

  const sendMessage = useCallback(
    async (userMessage: string) => {
      try {
        setError(null)
        setIsLoading(true)

        // Add user message
        addMessage('user', userMessage)

        // Send to chat API
        const chatMessages = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

        chatMessages.push({ role: 'user' as const, content: userMessage })

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: chatMessages }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || response.statusText
          throw new Error(errorMessage)
        }

        const data = await response.json()
        const aiResponse = data.response

        // Add assistant message
        addMessage('assistant', aiResponse, data.searchResults)

        setIsLoading(false)

        return {
          response: aiResponse,
          usedSearch: data.usedSearch,
          searchResults: data.searchResults,
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to send message'
        setError(errorMsg)
        options?.onError?.(errorMsg)
        setIsLoading(false)
        throw err
      }
    },
    [messages, addMessage, options]
  )

  const clearHistory = useCallback(() => {
    setMessages([])
    messageIdRef.current = 0
    setError(null)
  }, [])

  const toggleSearchMode = useCallback(() => {
    setSearchMode((prev) => !prev)
  }, [])

  const getLastMessage = useCallback(() => {
    return messages[messages.length - 1] || null
  }, [messages])

  const getConversationContext = useCallback(() => {
    return messages
      .slice(-5)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n')
  }, [messages])

  return {
    messages,
    isLoading,
    error,
    searchMode,
    sendMessage,
    addMessage,
    clearHistory,
    toggleSearchMode,
    getLastMessage,
    getConversationContext,
  }
}
