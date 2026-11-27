import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useApp } from '../context/AppContext.jsx'

const DEST = { admin: '/admin', rider: '/rider', cashier: '/cashier', kitchen: '/kitchen' }

const StaffLoginPage = () => {
    const { session, apiToken, setApiSession } = useAuth()
    const { api } = useApp()
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [msg, setMsg] = useState('')

    useEffect(() => {
        if (session && DEST[session.role] && apiToken) {
            navigate(DEST[session.role], { replace: true })
        }
    }, [session, apiToken, navigate])

    const fail = (text) => setMsg(text)

    const handleLogin = async () => {
        setMsg('')
        if (!username || !password) return fail('Enter your username and password.')

        // Try staff login first
        try {
            const result = await api.post('/auth/login/staff', { username, password })
            setApiSession(result)
            navigate(DEST[result.user.role] || DEST.rider)
            return
        } catch (e) {
            if (!/incorrect/i.test(e.message)) return fail(e.message)
        }

        // Otherwise try admin
        try {
            const result = await api.post('/auth/login/admin', { username, password })
            setApiSession(result)
            navigate(DEST.admin)
        } catch (e) {
            fail(/too many/i.test(e.message) ? e.message : 'Incorrect username or password.')
        }
    }

    return (
        <div className="auth-wrap" onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}>
            <aside className="auth-art">
                <div className="auth-brand">
                    <img src="/images/logo.jpg" alt="RiaGo logo" />
                    <span>RiaGo</span>
                </div>
                <div>
                    <div className="auth-emoji">🛵</div>
                    <h1>Staff<br />access.</h1>
                    <p>Rianne's Food Corner — for the admin and delivery riders only.</p>
                </div>
                <span className="blob b1"></span>
                <span className="blob b2"></span>
            </aside>

            <main className="auth-side">
                <div className="auth-card">
                    <h2>Staff log in</h2>
                    <p className="sub">Admin, cashier, kitchen and riders sign in here.</p>

                    <label>Username</label>
                    <input type="text" placeholder="Your username" autoCapitalize="none" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />

                    <label>Password</label>
                    <div className="pw-field">
                        <input type={showPass ? 'text' : 'password'} placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowPass(!showPass)} aria-label="Show password">👁️</button>
                    </div>

                    <button className="primary-btn" onClick={handleLogin}>Log in</button>

                    <div className="info-box">
                        🔒 Cashier and kitchen use the built-in accounts. Rider accounts are created by the admin.
                        Customers can log in <a href="/login">here</a>.
                    </div>

                    {msg && <p className="auth-msg error" role="alert">{msg}</p>}
                </div>
            </main>
        </div>
    )
}

export default StaffLoginPage
