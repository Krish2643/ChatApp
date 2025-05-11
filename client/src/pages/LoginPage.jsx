import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { login } from '../api/auth'

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-gray-100);
  padding: var(--space-4);
`

const LoginCard = styled.div`
  width: 100%;
  max-width: 400px;
  padding: var(--space-6);
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`

const Title = styled.h1`
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--space-4);
  color: var(--color-gray-900);
  text-align: center;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`

const Label = styled.label`
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-gray-700);
`

const Input = styled.input`
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gray-300);
  font-size: var(--font-size-md);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary-400);
    box-shadow: 0 0 0 2px var(--color-primary-100);
  }
`

const SubmitButton = styled.button`
  padding: var(--space-3);
  background-color: var(--color-primary-500);
  color: white;
  font-weight: 500;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  margin-top: var(--space-2);
  
  &:hover {
    background-color: var(--color-primary-600);
  }
  
  &:disabled {
    background-color: var(--color-gray-400);
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  padding: var(--space-3);
  background-color: var(--color-error-500);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-4);
`

const LinkText = styled.p`
  text-align: center;
  margin-top: var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  
  a {
    color: var(--color-primary-600);
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <LoginContainer>
      <LoginCard>
        <Title>Welcome back</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </FormGroup>
          
          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </SubmitButton>
        </Form>
        
        <LinkText>
          Don't have an account? <Link to="/register">Register here</Link>
        </LinkText>
      </LoginCard>
    </LoginContainer>
  )
}

export default LoginPage