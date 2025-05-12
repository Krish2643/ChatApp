import { FiMoreVertical } from 'react-icons/fi'
import styled from 'styled-components'
import { useUserStore } from '../store/UserStore'
import { useChatStore } from '../store/ChatStore'

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-gray-200);
  background-color: white;
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-primary-100);
  color: var(--color-primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--font-size-md);
  margin-right: var(--space-3);
`

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`

const UserName = styled.h3`
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-gray-900);
`

const UserStatus = styled.div`
  font-size: var(--font-size-sm);
  color: ${props => props.$online ? 'var(--color-success-500)' : 'var(--color-gray-500)'};
  display: flex;
  align-items: center;
`

const StatusIndicator = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  background-color: ${props => props.$online 
    ? 'var(--color-success-500)' 
    : 'var(--color-gray-400)'};
`

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: transparent;
  color: var(--color-gray-700);
  
  &:hover {
    background-color: var(--color-gray-100);
  }
`

const ChatHeader = () => {
  const { activeConversation } = useChatStore()
  const { user } = useUserStore()
  const { onlineUsers } = useChatStore()
  
  if (!activeConversation) return null
  
  const otherUser = activeConversation.participants.find(p => p._id !== user._id) || {}
  const isOnline = onlineUsers[otherUser._id] || false
  
  return (
    <HeaderContainer>
      <UserInfo>
        <Avatar>
          {otherUser.name ? otherUser.name.charAt(0).toUpperCase() : '?'}
        </Avatar>
        
        <UserDetails>
          <UserName>{otherUser.name}</UserName>
          <UserStatus $online={isOnline}>
            <StatusIndicator $online={isOnline} />
            {isOnline ? 'Online' : 'Offline'}
          </UserStatus>
        </UserDetails>
      </UserInfo>
      
      <ActionButton>
        <FiMoreVertical size={20} />
      </ActionButton>
    </HeaderContainer>
  )
}

export default ChatHeader