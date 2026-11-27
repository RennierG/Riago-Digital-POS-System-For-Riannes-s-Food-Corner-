import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

const SESSION_KEY = 'riago_session_v1'
const TOKEN_KEY = 'riago_api_token_v1'

const getSession = () => {
    try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY))
    } catch {
        return null
    }
}

const getToken = () => sessionStorage.getItem(TOKEN_KEY) || ''

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(getSession)
    const [apiToken, setApiToken] = useState(getToken)
    const navigate = useNavigate()

    const setApiSession = useCallback((payload) => {
        if (!payload || !payload.token || !payload.user) return false
        sessionStorage.setItem(TOKEN_KEY, payload.token)
        const s = {
            role: payload.user.role,
            id: payload.user.id,
            name: payload.user.name,
            phone: payload.user.phone || '',
            address: payload.user.address || '',
            email: payload.user.email || ''
        }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(s))
        setSession(s)
        setApiToken(payload.token)
        return true
    }, [])

    const logout = useCallback(() => {
        sessionStorage.removeItem(SESSION_KEY)
        sessionStorage.removeItem(TOKEN_KEY)
        setSession(null)
        setApiToken('')
        const role = getSession()?.role
        if (['cashier', 'kitchen'].includes(role)) {
            window.location.reload()
            return
        }
        const isStaff = session?.role !== 'customer'
        navigate(isStaff ? '/staff-login' : '/login', { replace: true })
    }, [navigate, session])

    return (
        <AuthContext.Provider value={{ session, apiToken, setApiSession, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
