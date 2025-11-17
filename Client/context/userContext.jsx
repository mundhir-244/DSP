import axios from 'axios'
import { createContext, useEffect, useState } from 'react'
import { StreamChat } from 'stream-chat'

export const UserContext = createContext({})

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null)
  const [streamChat, setStreamChat] = useState(null)
  const [streamToken, setStreamToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/profile', { withCredentials: true })
      if (!response || response.data == null) return

      const { user: user, streamToken } = response.data

      if (!user || !streamToken) throw new Error('Invalid profile response')

      const chat = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY)

      if (chat?.user?.id) {
        await chat.disconnectUser();
      }
      
      await chat.connectUser(
        {
          id: user.id,
          name: user.userName,
          email: user.email
        },
        streamToken
      )

      setUser({ ...user })
      setStreamToken(streamToken)
      setStreamChat(chat)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isInterrupted = false
    let chatInstance

    if (!user) {
      fetchUserProfile()
    } else {
      setLoading(false)
    }

    return () => {
      isInterrupted = true
      if (chatInstance) {
        chatInstance.disconnectUser()
        setStreamChat(null)
      }
    }
  }, [])

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        streamChat,
        setStreamToken,
        refreshUser: fetchUserProfile
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
