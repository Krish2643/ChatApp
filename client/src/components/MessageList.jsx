import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useUserStore } from '../store/userStore'
import { useChatStore } from '../store/chatStore'

const MessageListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`

const MessageBubble = styled.div`
  max-width: 70%;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  position: relative;
  word-break: break-word;
  
  ${props => props.$isSent ? `
    align-self: flex-end;
    background-color: var(--color-primary-500);
    color: white;
    border-bottom-right-radius: var(--radius-sm);
  ` : `
    align-self: flex-start;
    background-color: var(--color-gray-200);
    color: var(--color-gray-900);
    border-bottom-left-radius: var(--radius-sm);
  `}
`

const Timestamp = styled.div`
  font-size: var(--font-size-xs);
  color: ${props => props.$isSent ? 'rgba(255, 255, 255, 0.7)' : 'var(--color-gray-500)'};
  margin-top: var(--space-1);
  text-align: right;
`

const DateSeparator = styled.div`
  display: flex;
  align-items: center;
  margin: var(--space-4) 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: var(--color-gray-300);
  }
`

const DateLabel = styled.span`
  padding: 0 var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
`

const TypingIndicator = styled.div`
  align-self: flex-start;
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  font-style: italic;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-gray-500);
  text-align: center;
  padding: var(--space-4);
`

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: var(--space-4);
  color: var(--color-gray-400);
`

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
  }
}

const shouldShowDate = (currentMessage, previousMessage) => {
  if (!previousMessage) return true
  
  const currentDate = new Date(currentMessage.createdAt).toDateString()
  const prevDate = new Date(previousMessage.createdAt).toDateString()
  
  return currentDate !== prevDate
}

const MessageList = () => {
  const { user } = useUserStore()
  const { messages, activeConversation, typing } = useChatStore()
  const messagesEndRef = useRef(null)
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])
  
  if (!activeConversation) {
    return (
      <EmptyState>
        <EmptyStateIcon>💬</EmptyStateIcon>
        <h3>Select a conversation</h3>
        <p>Choose a conversation from the list or start a new chat</p>
      </EmptyState>
    )
  }
  
  if (messages.length === 0) {
    return (
      <EmptyState>
        <EmptyStateIcon>👋</EmptyStateIcon>
        <h3>No messages yet</h3>
        <p>Send a message to start the conversation!</p>
      </EmptyState>
    )
  }
  
  const otherParticipant = activeConversation.participants.find(p => p._id !== user._id)
  const isOtherUserTyping = typing[otherParticipant?._id] || false
  
  return (
    <MessageListContainer>
      {messages.map((message, index) => {
        const isSent = message.sender === user._id
        const showDate = shouldShowDate(message, messages[index - 1])
        
        return (
          <div key={message._id}>
            {showDate && (
              <DateSeparator>
                <DateLabel>{formatDate(message.createdAt)}</DateLabel>
              </DateSeparator>
            )}
            
            <MessageBubble $isSent={isSent}>
              {message.content}
              <Timestamp $isSent={isSent}>{formatTime(message.createdAt)}</Timestamp>
            </MessageBubble>
          </div>
        )
      })}
      
      {isOtherUserTyping && (
        <TypingIndicator>
          {otherParticipant.name} is typing...
        </TypingIndicator>
      )}
      
      <div ref={messagesEndRef} />
    </MessageListContainer>
  )
}

export default MessageList