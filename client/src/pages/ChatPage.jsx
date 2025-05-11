import { useEffect } from 'react'
import styled from 'styled-components'
import { useUserStore } from '../store/userStore'
import { useChatStore } from '../store/chatStore'
import { SOCKET_EVENTS } from '../config/constants'
import ConversationList from '../components/ConversationList'
import ChatHeader from '../components/ChatHeader'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'
import { logout } from '../api/auth'

const ChatLayout = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
`

const ChatSidebar = styled.div`
  flex: 0 0 350px;
  display: none;
  
  @media (min-width: 768px) {
    display: block;
  }
`

const MobileSidebar = styled.div`
  flex: 1;
  display: block;
  
  @media (min-width: 768px) {
    display: none;
  }
`

const ChatMain = styled.div`
  flex: 1;
  display: ${props => props.$showOnMobile ? 'flex' : 'none'};
  flex-direction: column;
  
  @media (min-width: 768px) {
    display: flex;
  }
`

const NoChatSelected = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-gray-100);
  
  @media (max-width: 767px) {
    display: none;
  }
`

const LogoutButton = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  background-color: var(--color-gray-200);
  color: var(--color-gray-700);
  font-size: var(--font-size-sm);
  
  &:hover {
    background-color: var(--color-gray-300);
  }
`

const ChatPage = () => {
  const { user, socket } = useUserStore()
  const { 
    activeConversation, 
    setActiveConversation,
    addMessage, 
    setTyping, 
    messages 
  } = useChatStore()
  
  const showSidebarOnMobile = !activeConversation
  
  useEffect(() => {
    if (!socket) return
    
    // Listen for new messages
    socket.on(SOCKET_EVENTS.NEW_MESSAGE, (data) => {
      const { message } = data
      addMessage(message)
      
      // If the message is from the active conversation, mark it as read
      if (activeConversation && message.conversation === activeConversation._id) {
        socket.emit('message_read', {
          messageId: message._id,
          conversationId: activeConversation._id
        })
      }
    })
    
    // Listen for typing indicators
    socket.on(SOCKET_EVENTS.TYPING, ({ conversationId, senderId }) => {
      if (activeConversation && conversationId === activeConversation._id) {
        setTyping(senderId, true)
      }
    })
    
    socket.on(SOCKET_EVENTS.STOP_TYPING, ({ conversationId, senderId }) => {
      if (activeConversation && conversationId === activeConversation._id) {
        setTyping(senderId, false)
      }
    })
    
    return () => {
      socket.off(SOCKET_EVENTS.NEW_MESSAGE)
      socket.off(SOCKET_EVENTS.TYPING)
      socket.off(SOCKET_EVENTS.STOP_TYPING)
    }
  }, [socket, addMessage, setTyping, activeConversation])
  
  const handleLogout = () => {
    logout()
  }
  
  return (
    <ChatLayout>
      <ChatSidebar>
        <ConversationList />
      </ChatSidebar>
      
      {showSidebarOnMobile && (
        <MobileSidebar>
          <ConversationList />
        </MobileSidebar>
      )}
      
      {activeConversation ? (
        <ChatMain $showOnMobile={!showSidebarOnMobile}>
          <ChatHeader />
          <MessageList />
          <MessageInput />
        </ChatMain>
      ) : (
        <NoChatSelected>
          <img 
            src="https://www.pngitem.com/pimgs/m/19-191913_chat-png-image-file-chat-icon-png-transparent.png" 
            alt="Select a chat" 
            style={{ width: '120px', marginBottom: '20px', opacity: 0.5 }}
          />
          <h2>Select a conversation</h2>
          <p>Choose a user to start chatting</p>
        </NoChatSelected>
      )}
      
      <LogoutButton onClick={handleLogout}>
        Logout
      </LogoutButton>
    </ChatLayout>
  )
}

export default ChatPage