// === SHELL VERSION for task 1.3.1 ===
// This is the initial shell — orders and actions added in commits 19 and 20

import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import HeaderContainer from '../components/HeaderContainer.jsx'

const RiderPage = () => {
    const { session } = useAuth()
    const [loading] = useState(false)
    const [error] = useState('')

    if (loading) return <div className="empty-state">Loading...</div>
    if (error) return <div className="empty-state">Could not load data: {error}</div>

    return (
        <>
            <HeaderContainer subtitle="| Delivery Rider" />
            <main className="pg">
                <div className="dashboard-heading">
                    <div>
                        <span className="eyebrow">DELIVERY OPERATIONS</span>
                        <h1>Delivery workspace</h1>
                        <p>Hi {session?.name || 'Rider'}! View your assigned orders here.</p>
                    </div>
                    <span className="role-chip">Rider</span>
                </div>
                <div className="empty-state">Orders will appear here soon.</div>
            </main>
        </>
    )
}

export default RiderPage
