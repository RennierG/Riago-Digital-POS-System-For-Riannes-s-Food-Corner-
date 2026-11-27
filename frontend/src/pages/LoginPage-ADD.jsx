// === ADD THESE to frontend/src/pages/LoginPage.jsx ===

// 1. Change initial view state from 'register' to 'login':
//    const [view, setView] = useState('login')

// 2. Add login state variables:
const [loginEmail, setLoginEmail] = useState('')
const [loginPass, setLoginPass] = useState('')
const [showLoginPass, setShowLoginPass] = useState(false)

// 3. Add useEffect to redirect if already logged in:
useEffect(() => {
    if (session && session.role === 'customer') navigate('/customer', { replace: true })
}, [session, navigate])

// 4. Add handleLogin function:
const handleLogin = async () => {
    clear()
    try {
        const result = await api.post('/auth/login/customer', { email: loginEmail, password: loginPass })
        setApiSession(result)
        navigate('/customer')
    } catch (e) {
        showMessage(e.message)
    }
}

// 5. Add onKeyDown handler:
const onKeyDown = (e) => {
    if (e.key !== 'Enter') return
    if (document.activeElement && ['BUTTON', 'A'].includes(document.activeElement.tagName)) return
    if (view === 'otp') handleVerifyOtp()
    else if (view === 'login') handleLogin()
    else handleRegister()
}

// 6. Add login form JSX inside the return (before register section):
{view === 'login' && (
    <section>
        <h2>Welcome back!</h2>
        <p className="sub">Log in to order your favorites.</p>
        <label>Email</label>
        <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
        <label>Password</label>
        <div className="pw-field">
            <input type={showLoginPass ? 'text' : 'password'} value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
            <button type="button" onClick={() => setShowLoginPass(!showLoginPass)}>👁️</button>
        </div>
        <button className="primary-btn" onClick={handleLogin}>Log in</button>
        <p className="auth-switch">New here? <a onClick={() => { setView('register'); clear() }}>Create an account</a></p>
    </section>
)}

// 7. Add tab switch link inside register section:
// After the Send verification code button:
// <p className="auth-switch">Already have an account? <a onClick={() => { setView('login'); clear() }}>Log in</a></p>

// 8. Update verifyRegistrationOtp to navigate after success:
// In handleVerifyOtp, after setApiSession(result):
// setTimeout(() => navigate('/customer'), 500)
