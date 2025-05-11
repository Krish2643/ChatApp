import { create } from 'zustand'
import { STORAGE_KEYS } from '../config/constants'

export const useUserStore = create((set) => ({
  user: null,
  token: localStorage.getItem(STORAGE_KEYS.TOKEN) || null,
  socket: null,
  
  setUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    set({ user })
  },
  
  setToken: (token) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
    set({ token })
  },
  
  setSocket: (socket) => set({ socket }),
  
  logout: () => {
    const { socket } = useUserStore.getState()
    if (socket) {
      socket.disconnect()
    }
    
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    
    set({ user: null, token: null, socket: null })
  }
}))