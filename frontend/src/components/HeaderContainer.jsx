import { useAuth } from '../context/AuthContext.jsx'

const HeaderContainer = ({ title, subtitle, showLogout = true, children }) => {
    const { session, logout } = useAuth()

    return (
        <header className="bar">
            <div className="brand">
                <img src="/images/logo.jpg" alt="RiaGo logo" />
                <div>
                    <span>RiaGo</span>
                    <small className="who">{subtitle || "Rianne's Food Corner"}</small>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {children}
                {session && showLogout && (
                    <>
                        <span className="who" style={{ fontWeight: 600 }}>Hi, {session.name}</span>
                        <button className="logout-btn" onClick={logout}>Log out</button>
                    </>
                )}
            </div>
        </header>
    )
}

export default HeaderContainer
