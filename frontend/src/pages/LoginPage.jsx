import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useApp } from '../context/AppContext.jsx'

const LoginPage = () => {
    const { session, setApiSession } = useAuth()
    const { api } = useApp()
    const navigate = useNavigate()

    const [view, setView] = useState('register') // start on register for 1.1.1
    const [msg, setMsg] = useState({ text: '', type: '' })
    const [registering, setRegistering] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [pendingEmail, setPendingEmail] = useState('')
    const [pendingReg, setPendingReg] = useState(null)

    // Register fields
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [regEmail, setRegEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [barangay, setBarangay] = useState('')
    const [city, setCity] = useState('')
    const [province, setProvince] = useState('')
    const [regPass, setRegPass] = useState('')
    const [showRegPass, setShowRegPass] = useState(false)
    const [otp, setOtp] = useState('')

    const showMessage = (text, type = 'error') => setMsg({ text, type })
    const clear = () => setMsg({ text: '', type: '' })

    const handleRegister = async () => {
        if (registering) return
        setRegistering(true)
        clear()
        const reg = { firstName, lastName, email: regEmail, phone, barangayStreet: barangay, city, province, password: regPass }
        if (!reg.firstName || !reg.lastName) { setRegistering(false); return showMessage('Please enter your first name and last name.') }
        if (!/^\d{11}$/.test(reg.phone)) { setRegistering(false); return showMessage('Contact number must be exactly 11 digits.') }
        if (!reg.barangayStreet || !reg.city || !reg.province) { setRegistering(false); return showMessage('Please complete your address.') }
        try {
            const result = await api.post('/auth/register/request-otp', reg)
            setPendingReg(reg)
            setPendingEmail(reg.email)
            showMessage(result.message || 'Verification code sent!', 'success')
            setView('otp')
        } catch (e) {
            showMessage(e.message)
        } finally {
            setRegistering(false)
        }
    }

    const handleVerifyOtp = async () => {
        if (verifying) return
        setVerifying(true)
        clear()
        try {
            const result = await api.post('/auth/register/verify-otp', { email: pendingEmail, otp: otp.trim() })
            showMessage(result.message || 'Account created!', 'success')
            // login added in task 1.1.2
        } catch (e) {
            showMessage(e.message)
            setVerifying(false)
        }
    }

    const handleResend = async () => {
        if (!pendingReg) return
        clear()
        try {
            const result = await api.post('/auth/register/request-otp', pendingReg)
            setOtp('')
            showMessage((result.message || 'Code sent.') + ' Older codes no longer work.', 'success')
        } catch (e) { showMessage(e.message) }
    }

    return (
        <div className="auth-wrap">
            <aside className="auth-art photo" role="img" aria-label="RiaGo Korean food illustration"></aside>
            <main className="auth-side">
                <div className="auth-card">
                    {view === 'register' && (
                        <section>
                            <h2>Create account</h2>
                            <p className="sub">Sign up to start ordering.</p>
                            <div className="two">
                                <div><label>First name</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
                                <div><label>Last name</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
                            </div>
                            <div className="two">
                                <div><label>Email</label><input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} /></div>
                                <div><label>Contact number</label><input type="tel" inputMode="numeric" maxLength={11} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} /></div>
                            </div>
                            <label>Barangay / Street</label>
                            <input type="text" value={barangay} onChange={(e) => setBarangay(e.target.value)} />
                            <div className="two">
                                <div><label>City / Municipality</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} /></div>
                                <div><label>Province</label><input type="text" value={province} onChange={(e) => setProvince(e.target.value)} /></div>
                            </div>
                            <label>Password</label>
                            <div className="pw-field">
                                <input type={showRegPass ? 'text' : 'password'} placeholder="At least 8 characters" value={regPass} onChange={(e) => setRegPass(e.target.value)} />
                                <button type="button" onClick={() => setShowRegPass(!showRegPass)}>👁️</button>
                            </div>
                            <button className="primary-btn" onClick={handleRegister} disabled={registering}>Send verification code</button>
                        </section>
                    )}
                    {view === 'otp' && (
                        <section>
                            <h2>Verify your email</h2>
                            <p className="sub">We sent a 6-digit code to <b>{pendingEmail}</b>.</p>
                            <label>Email verification code</label>
                            <input type="text" inputMode="numeric" maxLength={6} id="otp-code" value={otp} onChange={(e) => setOtp(e.target.value)} />
                            <button className="primary-btn" onClick={handleVerifyOtp} disabled={verifying}>Verify and create account</button>
                            <button className="secondary-btn" type="button" onClick={handleResend}>Resend code</button>
                            <p className="auth-switch"><a onClick={() => { setView('register'); clear() }}>Back to registration</a></p>
                        </section>
                    )}
                    {msg.text && <p className={`auth-msg ${msg.type}`} role="alert">{msg.text}</p>}
                </div>
            </main>
        </div>
    )
}

export default LoginPage
