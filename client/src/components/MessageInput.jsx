import { useState, useEffect, useRef } from 'react'
import { FiSend, FiPaperclip } from 'react-icons/fi'
import { useUserStore } from '../store/UserStore'
import { useChatStore } from '../store/ChatStore'
import { sendMessage } from '../api/chat'
import { SOCKET_EVENTS } from '../config/constants'
import styled from 'styled-components'

const MessageInputWrapper = styled.form`
  display: flex;
  align-items: center;
  padding: var(--space-3);
  background-color: white;
  border-top: 1px solid var(--color-gray-200);
  position: sticky;
  bottom: 0;
  width: 100%;
`

const Input = styled.input`
  flex-grow: 1;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-gray-300);
  font-size: var(--font-size-md);
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--color-primary-400);
  }
`

const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-primary-500);
  color: white;
  margin-left: var(--space-2);
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-primary-600);
  }

  &:disabled {
    background-color: var(--color-gray-400);
    cursor: not-allowed;
  }
`

const AttachButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: transparent;
  color: var(--color-gray-600);
  margin-right: var(--space-2);
  transition: color 0.2s;

  &:hover {
    color: var(--color-primary-500);
  }
`

const MessageInput = () => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { socket, user } = useUserStore()
  const { activeConversation, addMessage } = useChatStore()
  const typingTimeoutRef = useRef(null)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() || !activeConversation) return
    
    try {
      // Send to API
      const newMessage = await sendMessage(activeConversation._id, message)
      
      // Add to local state
      addMessage(newMessage)
      
      // Emit to socket
      if (socket) {
        const receiverId = activeConversation.participants.find(p => p._id !== user._id)?._id
        
        socket.emit(SOCKET_EVENTS.NEW_MESSAGE, {
          message: newMessage,
          receiverId
        })
        
        // Stop typing indicator
        socket.emit(SOCKET_EVENTS.STOP_TYPING, {
          conversationId: activeConversation._id,
          receiverId
        })
      }
      
      // Reset state
      setMessage('')
      setIsTyping(false)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }
  
  const handleChange = (e) => {
    setMessage(e.target.value)
    
    if (!isTyping && socket && activeConversation) {
      setIsTyping(true)
      socket.emit(SOCKET_EVENTS.TYPING, {
        conversationId: activeConversation._id,
        receiverId: activeConversation.participants.find(p => p._id !== user._id)?._id
      })
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && socket && activeConversation) {
        setIsTyping(false)
        socket.emit(SOCKET_EVENTS.STOP_TYPING, {
          conversationId: activeConversation._id,
          receiverId: activeConversation.participants.find(p => p._id !== user._id)?._id
        })
      }
    }, 2000)
  }
  
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])
  
  if (!activeConversation) return null

  return (
    <MessageInputWrapper onSubmit={handleSubmit}>
      <AttachButton type="button">
        <FiPaperclip size={20} />
      </AttachButton>
      <Input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={handleChange}
      />
      <SendButton type="submit" disabled={!message.trim()}>
        <FiSend size={18} />
      </SendButton>
    </MessageInputWrapper>
  )
}

export default MessageInput