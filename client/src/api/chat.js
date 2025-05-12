import api from './auth'
import { useChatStore } from '../store/ChatStore'

export const getConversations = async () => {
  try {
    useChatStore.getState().setLoading(true)
    const response = await api.get('/conversations')
    useChatStore.getState().setConversations(response.data)
    return response.data
  } catch (error) {
    useChatStore.getState().setError(error.response?.data?.message || 'Failed to fetch conversations')
    throw error
  } finally {
    useChatStore.getState().setLoading(false)
  }
}

export const getMessages = async (conversationId) => {
  try {
    useChatStore.getState().setLoading(true)
    const response = await api.get(`/messages/${conversationId}`)
    useChatStore.getState().setMessages(response.data)
    return response.data
  } catch (error) {
    useChatStore.getState().setError(error.response?.data?.message || 'Failed to fetch messages')
    throw error
  } finally {
    useChatStore.getState().setLoading(false)
  }
}

export const sendMessage = async (conversationId, content) => {
  try {
    const response = await api.post('/messages', {
      conversation: conversationId,
      content
    })
    return response.data
  } catch (error) {
    useChatStore.getState().setError(error.response?.data?.message || 'Failed to send message')
    throw error
  }
}

export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/users/search?q=${query}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Search failed' }
  }
}

export const createConversation = async (userId) => {
  try {
    const response = await api.post('/conversations', {
      recipient: userId
    })
    
    // Add the new conversation to the store
    const currentConversations = useChatStore.getState().conversations
    useChatStore.getState().setConversations([...currentConversations, response.data])
    
    return response.data
  } catch (error) {
    useChatStore.getState().setError(error.response?.data?.message || 'Failed to create conversation')
    throw error
  }
}