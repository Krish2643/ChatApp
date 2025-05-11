import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  typing: {},
  loading: false,
  error: null,
  
  setConversations: (conversations) => set({ conversations }),
  
  setActiveConversation: (activeConversation) => {
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
    }
  },
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => {
    const { messages, conversations, activeConversation } = get()
    
    // Add message to messages list
    set({ messages: [...messages, message] })
    
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
  
  setTyping: (userId, isTyping) => {
    set(state => ({
      typing: {
        ...state.typing,
        [userId]: isTyping
      }
    }))
  },
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error })
}))