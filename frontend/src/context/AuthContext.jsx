import React, { createContext, useContext, useState, useEffect } from 'react'
import ApiService from '../services/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true) // Add loading state

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        // Verify token with backend
        const response = await ApiService.getProfile()
        if (response.success) {
          setUser(response.user)
          setIsAuthenticated(true)
        } else {
          // Invalid token, remove it
          localStorage.removeItem('token')
          setUser(null)
          setIsAuthenticated(false)
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false) // Set loading to false after check
    }
  }

  const login = async (email, password) => {
    try {
      const response = await ApiService.login(email, password)
      if (response.success) {
        localStorage.setItem('token', response.token)
        setUser(response.user)
        setIsAuthenticated(true)
        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: error.message }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await ApiService.register(name, email, password)
      if (response.success) {
        localStorage.setItem('token', response.token)
        setUser(response.user)
        setIsAuthenticated(true)
        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    loading, // Include loading in context value
    login,
    register,
    logout,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
