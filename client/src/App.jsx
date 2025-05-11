import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import { io } from 'socket.io-client'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'
import ProtectedRoute from './components/ProtectedRoute'
import { useUserStore } from './store/userStore'
import { SOCKET_URL } from './config/constants'

function App() {
  const { user, socket, setSocket } = useUserStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('chatUser')
    if (savedUser) {
      useUserStore.getState().setUser(JSON.parse(savedUser))
    }
    setInitialized(true)
  }, [])

  useEffect(() => {
    if (user && !socket) {
      const newSocket = io(SOCKET_URL, {
        query: {
          userId: user._id
        }
      })

      newSocket.on('connect', () => {
        console.log('Connected to socket server')
      })

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket server')
      })

      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
    }
  }, [user, socket, setSocket])

  if (!initialized) {
    return <div className="loading">Loading...</div>
  }

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
    </BrowserRouter>
  )
}

export default App