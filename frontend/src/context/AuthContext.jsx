import React, { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token)
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, loading: false }
    case 'LOGOUT':
      localStorage.removeItem('token')
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false }
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }
      try {
        const res = await api.get('/auth/me')
        dispatch({ type: 'SET_USER', payload: res.data.user })
      } catch {
        dispatch({ type: 'LOGOUT' })
      }
    }
    loadUser()
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    dispatch({ type: 'LOGIN_SUCCESS', payload: res.data })
    return res.data
  }

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role })
    dispatch({ type: 'LOGIN_SUCCESS', payload: res.data })
    return res.data
  }

  const logout = () => dispatch({ type: 'LOGOUT' })

  const updateUser = (updates) => dispatch({ type: 'UPDATE_USER', payload: updates })

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
