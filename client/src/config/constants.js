// API URLs
export const API_URL = 'https://chatapp-1-7q6f.onrender.com/api'
export const SOCKET_URL = 'https://chatapp-1-7q6f.onrender.com'
// http://localhost:8000
// Routes
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  CHAT: '/'
}

// Local storage keys
export const STORAGE_KEYS = {
  USER: 'chatUser',
  TOKEN: 'chatToken'
}

// Socket events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  USER_CONNECTED: 'user_connected',
  USER_DISCONNECTED: 'user_disconnected',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',
  NEW_MESSAGE: 'new_message',
  DELIVERED: 'message_delivered'
}