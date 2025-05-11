import { FiUser, FiUserPlus } from 'react-icons/fi'
import styled from 'styled-components'

const ResultsContainer = styled.div`
  position: absolute;
  top: calc(100% - var(--space-2));
  left: var(--space-3);
  right: var(--space-3);
  background-color: white;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gray-300);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 300px;
  overflow-y: auto;
`

const ResultItem = styled.div`
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--color-gray-100);
  }
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
  flex-shrink: 0;
`

const UserInfo = styled.div`
  flex: 1;
`

const UserName = styled.h4`
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--color-gray-900);
  margin-bottom: var(--space-1);
`

const UserEmail = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
`

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--color-primary-50);
  color: var(--color-primary-600);
  
  &:hover {
    background-color: var(--color-primary-100);
  }
`

const NoResults = styled.div`
  padding: var(--space-4);
  text-align: center;
  color: var(--color-gray-600);
`

const UserSearchResults = ({ results, onSelect, onClose }) => {
  return (
    <ResultsContainer onClick={(e) => e.stopPropagation()}>
      {results.length > 0 ? (
        results.map(user => (
          <ResultItem key={user._id} onClick={() => onSelect(user)}>
            <Avatar>
              {user.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
            </Avatar>
            
            <UserInfo>
              <UserName>{user.name}</UserName>
              <UserEmail>{user.email}</UserEmail>
            </UserInfo>
            
            <AddButton>
              <FiUserPlus size={16} />
            </AddButton>
          </ResultItem>
        ))
      ) : (
        <NoResults>No users found</NoResults>
      )}
    </ResultsContainer>
  )
}

export default UserSearchResults