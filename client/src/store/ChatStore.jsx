import { create } from 'zustand'
import { getMessages } from '../api/chat'

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  typing: {},
  onlineUsers: {},
  loading: false,
  error: null,
  
  setConversations: (conversations) => set({ conversations }),
  
  setActiveConversation: async (activeConversation) => {
    set({ activeConversation })
    
    if (activeConversation) {
      const { conversations } = get()
      // Mark the conversation as read
      const updatedConversations = conversations.map(conv => 
        conv._id === activeConversation._id 
          ? { ...conv, unread: 0 } 
          : conv
      )
      set({ conversations: updatedConversations })
      
      // Load messages for the conversation
      try {
        const messages = await getMessages(activeConversation._id)
        set({ messages })
      } catch (error) {
        console.error('Failed to load messages:', error)
      }
    } else {
      set({ messages: [] })
    }
  },
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => {
    const { messages, conversations, activeConversation } = get()
    
    // Add message to messages list if it's for the active conversation
    if (activeConversation && message.conversation === activeConversation._id) {
      set({ messages: [...messages, message] })
    }
    
    // Update conversations list with latest message and unread count
    const updatedConversations = conversations.map(conv => {
      if (conv._id === message.conversation) {
        const unreadIncrement = 
          activeConversation && activeConversation._id === conv._id 
            ? 0 
            : 1
        
        return {
          ...conv,
          lastMessage: message,
          unread: (conv.unread || 0) + unreadIncrement
        }
      }
      return conv
    })
    
    set({ conversations: updatedConversations })
  },
  
  updateConversation: (conversationId, updates) => {
    const { conversations } = get()
    const updatedConversations = conversations.map(conv => 
      conv._id === conversationId 
        ? { ...conv, ...updates }
        : conv
    )
    set({ conversations: updatedConversations })
  },
  
  setTyping: (userId, isTyping) => {
    set(state => ({
      typing: {
        ...state.typing,
        [userId]: isTyping
      }
    }))
  },
  
  setOnlineUsers: (users) => {
    const onlineUsersMap = {}
    users.forEach(id => {
      onlineUsersMap[id] = true
    })
    set({ onlineUsers: onlineUsersMap })
  },
  
  updateUserStatus: (userId, status) => {
    set(state => ({
      onlineUsers: {
        ...state.onlineUsers,
        [userId]: status === 'online'
      }
    }))
  },
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error })
}))