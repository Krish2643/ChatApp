import { useEffect, useState } from 'react'
import { FiSearch, FiUser, FiEdit } from 'react-icons/fi'
import styled from 'styled-components'
import { useChatStore } from '../store/chatStore'
import { useUserStore } from '../store/userStore'
import { getConversations, searchUsers, createConversation } from '../api/chat'
import UserSearchResults from './UserSearchResults'

const SidebarContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-right: 1px solid var(--color-gray-200);
  
  @media (min-width: 768px) {
    width: 350px;
    min-width: 350px;
  }
`

const SidebarHeader = styled.div`
  padding: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-gray-200);
`

const Title = styled.h2`
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-gray-900);
`

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
  
  &:hover {
    background-color: var(--color-gray-200);
  }
`

const SearchContainer = styled.div`
  padding: var(--space-3);
  position: relative;
`

const SearchInput = styled.input`
  width: 100%;
  padding: var(--space-3) var(--space-3) var(--space-3) var(--space-8);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gray-300);
  font-size: var(--font-size-sm);
  background-color: var(--color-gray-100);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary-400);
    background-color: white;
  }
`

const SearchIcon = styled.div`
  position: absolute;
  left: var(--space-5);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gray-500);
`

const ConversationListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`

const ConversationItem = styled.div`
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  
  ${props => props.$active && `
    background-color: var(--color-primary-50);
  `}
  
  &:hover {
    background-color: ${props => props.$active ? 'var(--color-primary-100)' : 'var(--color-gray-100)'};
  }
  
  ${props => props.$unread && `
    &::after {
      content: '';
      position: absolute;
      right: var(--space-4);
      top: 50%;
      transform: translateY(-50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--color-primary-500);
    }
  `}
`

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-primary-100);
  color: var(--color-primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--font-size-md);
  margin-right: var(--space-3);
  flex-shrink: 0;
`

const ConversationInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const ConversationName = styled.h3`
  font-size: var(--font-size-md);
  font-weight: ${props => props.$unread ? '600' : '500'};
  color: var(--color-gray-900);
  margin-bottom: var(--space-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const LastMessage = styled.p`
  font-size: var(--font-size-sm);
  color: ${props => props.$unread ? 'var(--color-gray-800)' : 'var(--color-gray-600)'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: ${props => props.$unread ? '500' : '400'};
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

const ConversationList = () => {
  const { user, socket } = useUserStore()
  const { conversations, activeConversation, setActiveConversation, loading } = useChatStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState({})
  
  useEffect(() => {
    getConversations()
  }, [])
  
  useEffect(() => {
    if (!socket) return
    
    socket.on('user_status', ({ userId, status }) => {
      setOnlineUsers(prev => ({
        ...prev,
        [userId]: status === 'online'
      }))
    })
    
    socket.on('online_users', (users) => {
      const usersMap = {}
      users.forEach(id => {
        usersMap[id] = true
      })
      setOnlineUsers(usersMap)
    })
    
    return () => {
      socket.off('user_status')
      socket.off('online_users')
    }
  }, [socket])
  
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setShowSearch(true)
      try {
        const results = await searchUsers(searchQuery)
        // Filter out current user and users already in conversations
        const filteredResults = results.filter(u => 
          u._id !== user._id && 
          !conversations.some(c => 
            c.participants.some(p => p._id === u._id)
          )
        )
        setSearchResults(filteredResults)
      } catch (error) {
        console.error('Search failed:', error)
      }
    } else {
      setShowSearch(false)
    }
  }
  
  const handleUserSelect = async (selectedUser) => {
    try {
      const newConversation = await createConversation(selectedUser._id)
      setActiveConversation(newConversation)
      setShowSearch(false)
      setSearchQuery('')
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }
  
  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user._id) || {}
  }
  
  if (loading && conversations.length === 0) {
    return <div>Loading...</div>
  }
  
  return (
    <SidebarContainer>
      <SidebarHeader>
        <Title>Chats</Title>
        <IconButton>
          <FiEdit size={20} />
        </IconButton>
      </SidebarHeader>
      
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
          onBlur={() => !searchQuery && setShowSearch(false)}
        />
        <SearchIcon>
          <FiSearch size={16} />
        </SearchIcon>
        
        {showSearch && (
          <UserSearchResults 
            results={searchResults} 
            onSelect={handleUserSelect} 
            onClose={() => setShowSearch(false)}
          />
        )}
      </SearchContainer>
      
      <ConversationListContainer>
        {conversations.map(conversation => {
          const otherUser = getOtherParticipant(conversation)
          const isActive = activeConversation?._id === conversation._id
          const hasUnread = conversation.unread > 0
          const isOnline = onlineUsers[otherUser._id] || false
          
          return (
            <ConversationItem 
              key={conversation._id}
              $active={isActive}
              $unread={hasUnread}
              onClick={() => setActiveConversation(conversation)}
            >
              <Avatar>
                {otherUser.name ? otherUser.name.charAt(0).toUpperCase() : <FiUser />}
              </Avatar>
              
              <ConversationInfo>
                <ConversationName $unread={hasUnread}>
                  <StatusIndicator $online={isOnline} />
                  {otherUser.name}
                </ConversationName>
                
                <LastMessage $unread={hasUnread}>
                  {conversation.lastMessage?.content || 'Start a conversation'}
                </LastMessage>
              </ConversationInfo>
            </ConversationItem>
          )
        })}
        
        {conversations.length === 0 && (
          <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-gray-600)' }}>
            No conversations yet. Search for users to start chatting!
          </div>
        )}
      </ConversationListContainer>
    </SidebarContainer>
  )
}

export default ConversationList