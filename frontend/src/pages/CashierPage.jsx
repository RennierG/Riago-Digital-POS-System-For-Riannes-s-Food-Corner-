import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import HeaderContainer from '../components/HeaderContainer.jsx'
import StatCard from '../components/StatCard.jsx'

const CashierPage = () => {
    const { api, refresh, run, menu, orders, riderList, money, picUrl, hasPic, statusClass, ago, chipClass, chipLabel } = useApp()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('requests')
    const [counterQty, setCounterQty] = useState({})
    const [cashierName, setCashierName] = useState('Cashier')
    const [tableNumber, setTableNumber] = useState('')
    const [received, setReceived] = useState('')
    const [counterMsg, setCounterMsg] = useState({ text: '', type: '' })

    useEffect(() => {
        refresh('cashier').then(() => setLoading(false)).catch((e) => { setError(e.message); setLoading(false) })
    }, [])

    useEffect(() => {
        const tick = () => refresh('cashier').catch(() => {})
        const id = setInterval(tick, 5000)
        const onFocus = () => tick()
        window.addEventListener('focus', onFocus)
        return () => { clearInterval(id); window.removeEventListener('focus', onFocus) }
    }, [refresh])

    const pending = orders.filter((o) => o.type === 'Online' && o.status === 'Order Placed')
    const readyForRider = orders.filter((o) => o.type === 'Online' && o.prep === 'Ready' && o.status === 'Order in Process' && !o.rider)
    const counterReady = orders.filter((o) => o.type === 'Counter' && o.prep === 'Ready' && o.status === 'Order in Process')
    const revenue = orders.filter((o) => o.type === 'Counter' || o.status === 'Order Complete').reduce((s, o) => s + o.total, 0)

    const availableMenu = menu.filter((m) => m.available && m.stock > 0)

    const setQty = (id, val) => setCounterQty((prev) => ({ ...prev, [id]: val }))
    const stepQty = (id, delta, max) => setCounterQty((prev) => ({ ...prev, [id]: Math.min(max, Math.max(0, (prev[id] || 0) + delta)) }))

    const counterTotal = availableMenu.reduce((s, m) => s + (counterQty[m.id] || 0) * m.price, 0)
    const change = Number(received) > 0 ? Number(received) - counterTotal : null

    const handleCounterSubmit = async () => {
        const items = availableMenu.filter((m) => counterQty[m.id] > 0).map((m) => ({ menu_item_id: m.id, quantity: counterQty[m.id] }))
        if (!items.length) return setCounterMsg({ text: 'Select at least one menu item.', type: 'error' })
        if (Number(received) < counterTotal) return setCounterMsg({ text: 'Amount received is not enough.', type: 'error' })
        const customerLabel = tableNumber.trim()
            ? `Table ${tableNumber.trim()}`
            : (cashierName || 'Cashier')
        try {
            await run(() => api.post('/orders/counter', { customer_name: customerLabel, items, amount_received: Number(received) }), 'cashier')
            setCounterQty({})
            setReceived('')
            setTableNumber('')
            setCounterMsg({ text: '', type: '' })
        } catch (e) {
            setCounterMsg({ text: e.message, type: 'error' })
        }
    }

    const CxOrder = ({ o, children }) => (
        <article className="cx-order">
            <div className="cx-top">
                <div className="cx-id">
                    <b>{o.number}</b>
                    <span className={`cx-type ${o.type === 'Online' ? 'on' : 'co'}`}>{o.type}</span>
                    <span className="cx-time">{ago(o.created)}</span>
                </div>
                <div className="cx-chips">
                    <span className={`cx-chip ${chipClass(o.status)}`}>{chipLabel(o.status)}</span>
                    {o.status === 'Order in Process' && <span className="cx-chip kit">Kitchen: {o.prep || 'New'}</span>}
                </div>
            </div>
            <p className="cx-items">{(o.items || []).map((i) => `${i.qty}× ${i.name}`).join(', ')}</p>
            {o.type === 'Online' && (
                <p className="cx-cust"><b>{o.customer || 'Customer'}</b>
                    {o.contact && ` · ${o.contact}`}
                    {o.address && <span>{o.address}</span>}
                </p>
            )}
            <div className="cx-bottom">
                <div className="cx-total">{money(o.total)}</div>
                {o.rider && <span className="cx-rider">🛵 {o.rider}</span>}
                {children && <div className="cx-actions">{children}</div>}
            </div>
        </article>
    )

    const [riderSelections, setRiderSelections] = useState({})

    const tabs = [
        ['requests', 'Requests', pending.length],
        ['rider', 'Ready for rider', readyForRider.length],
        ['pickup', 'Counter pickup', counterReady.length],
        ['all', 'All orders', orders.length]
    ]

    if (loading) return <div className="empty-state">Loading...</div>
    if (error) return <div className="empty-state">Could not load data: {error}</div>

    return (
        <>
            <HeaderContainer subtitle="| Cashier" showLogout={false} />
            <main className="pg">
                <div className="cx-head">
                    <h1>Cashier</h1>
                    <p>Review online orders, process walk-in customers, and hand orders to riders.</p>
                </div>

                <div className="cx-stats">
                    <StatCard label="Pending online" value={pending.length} />
                    <StatCard label="Orders today" value={orders.length} />
                    <StatCard label="Ready for rider" value={readyForRider.length} />
                    <StatCard label="Recorded sales" value={money(revenue)} />
                </div>

                <div className="cx-layout">
                    <section className="cx-main">
                        <div className="cx-tabs" role="tablist">
                            {tabs.map(([k, l, n]) => (
                                <button key={k} role="tab" className={`cx-tab${activeTab === k ? ' on' : ''}${k === 'requests' && n ? ' hot' : ''}`} onClick={() => setActiveTab(k)}>
                                    {l}<b>{n}</b>
                                </button>
                            ))}
                        </div>

                        <div className="cx-list">
                            {activeTab === 'requests' && (pending.length > 0 ? pending.map((o) => (
                                <CxOrder key={o.id} o={o}>
                                    <button className="primary-btn small-btn" onClick={() => run(() => api.post(`/orders/${o.id}/accept`), 'cashier')}>Accept order</button>
                                    <button className="danger-btn small-btn" onClick={() => run(() => api.post(`/orders/${o.id}/reject`), 'cashier')}>Reject</button>
                                </CxOrder>
                            )) : <div className="cx-empty">No pending online orders. You are all caught up! ✨</div>)}

                            {activeTab === 'rider' && (readyForRider.length > 0 ? readyForRider.map((o) => (
                                <CxOrder key={o.id} o={o}>
                                    <select className="inline-select" value={riderSelections[o.id] || ''} onChange={(e) => setRiderSelections((prev) => ({ ...prev, [o.id]: e.target.value }))} aria-label="Choose rider">
                                        {riderList.length > 0
                                            ? riderList.map((r) => <option key={r.id} value={r.id}>{r.full_name}</option>)
                                            : <option value="">No riders yet</option>
                                        }
                                    </select>
                                    <button className="primary-btn small-btn" onClick={() => {
                                        const rider = riderSelections[o.id] || riderList[0]?.id
                                        if (!rider) return alert('Choose a rider first.')
                                        run(() => api.post(`/orders/${o.id}/assign-rider`, { rider_id: Number(rider) }), 'cashier')
                                    }}>Assign rider</button>
                                </CxOrder>
                            )) : <div className="cx-empty">No prepared online orders waiting for a rider.</div>)}

                            {activeTab === 'pickup' && (counterReady.length > 0 ? counterReady.map((o) => (
                                <CxOrder key={o.id} o={o}>
                                    <button className="success-btn small-btn" onClick={() => run(() => api.post(`/orders/${o.id}/release`), 'cashier')}>Mark released to customer</button>
                                </CxOrder>
                            )) : <div className="cx-empty">No counter orders ready for release.</div>)}

                            {activeTab === 'all' && (orders.length > 0 ? [...orders].reverse().map((o) => (
                                <CxOrder key={o.id} o={o} />
                            )) : <div className="cx-empty">No orders have been recorded yet.</div>)}
                        </div>
                    </section>

                    {/* Counter order panel */}
                    <aside className="cx-panel">
                        <span className="cx-eyebrow">WALK-IN CUSTOMER</span>
                        <h2>New counter order</h2>
                        <label>Cashier name</label>
                        <input type="text" value={cashierName} onChange={(e) => setCashierName(e.target.value)} />
                        <label>Table number <small style={{ fontWeight: 400, color: '#a28b98' }}>(optional)</small></label>
                        <input type="text" placeholder="e.g. 5" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />

                        <div className="cx-menu">
                            {availableMenu.length > 0 ? availableMenu.map((m) => (
                                <div key={m.id} className="cx-row">
                                    <span className="cx-name">
                                        {m.emoji || '🍽️'} {m.name}
                                        <small>{money(m.price)} · {m.stock} left</small>
                                    </span>
                                    <div className="cx-step">
                                        <button type="button" onClick={() => stepQty(m.id, -1, m.stock)}>−</button>
                                        <input type="number" min={0} max={m.stock} value={counterQty[m.id] || 0} onChange={(e) => setQty(m.id, Math.min(m.stock, Math.max(0, Math.floor(Number(e.target.value) || 0))))} />
                                        <button type="button" onClick={() => stepQty(m.id, 1, m.stock)}>+</button>
                                    </div>
                                </div>
                            )) : <p className="muted-copy">No available menu items.</p>}
                        </div>

                        <label>Amount received</label>
                        <input type="number" min={0} placeholder="0.00" value={received} onChange={(e) => setReceived(e.target.value)} />

                        <div className="cx-sum">
                            <div className="counter-total">
                                <span>Total</span>
                                <b>{money(counterTotal)}</b>
                            </div>
                            {change !== null && (
                                <div className={`cx-change${change < 0 ? ' short' : ''}`}>
                                    {change >= 0 ? `Change: ${money(change)}` : `Short by ${money(-change)}`}
                                </div>
                            )}
                        </div>

                        <button className="primary-btn full" onClick={handleCounterSubmit}>Confirm counter order →</button>
                        {counterMsg.text && <p className={`form-message ${counterMsg.type}`}>{counterMsg.text}</p>}
                    </aside>
                </div>
            </main>
        </>
    )
}

export default CashierPage
