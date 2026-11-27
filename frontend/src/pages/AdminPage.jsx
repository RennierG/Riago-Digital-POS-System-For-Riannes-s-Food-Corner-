import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useApp } from '../context/AppContext.jsx'

const SETTINGS_KEY = 'riago_admin_settings_v1'
const getSettings = () => { try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { threshold: 5 } } catch { return { threshold: 5 } } }

const AdminPage = () => {
    const { logout } = useAuth()
    const { api, refresh, run, menu, orders, customerList, staffList, loadAccounts, money, statusClass, picUrl, hasPic } = useApp()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [active, setActive] = useState('Dashboard')
    const [range, setRange] = useState('7D')
    const [settings, setSettings] = useState(getSettings)
    const photoInputRef = useRef(null)
    const photoForRef = useRef(null)

    const nav = ['Dashboard', 'Menu Management', 'Inventory Management', 'Sales Reports', 'Account Management', 'Settings']
    const icon = { Dashboard: '▦', 'Menu Management': '♨', 'Inventory Management': '▣', 'Sales Reports': '▥', 'Account Management': '♙', Settings: '⚙' }

    useEffect(() => {
        refresh('admin').then(() => setLoading(false)).catch((e) => { setError(e.message); setLoading(false) })
    }, [])

    const setPage = async (p) => {
        setActive(p)
        try {
            await refresh('admin')
            if (p === 'Account Management') await loadAccounts()
        } catch (e) { alert(e.message) }
    }

    const isSale = (o) => o.status === 'Order Complete' || (o.type === 'Counter' && o.prep === 'Ready')
    const sales = orders.filter(isSale)
    const low = menu.filter((m) => !m.archived && Number(m.stock) <= settings.threshold)

    const fmtDate = (d) => { const x = new Date(d); return Number.isNaN(x.getTime()) ? '—' : x.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) }

    const totalSales = (list) => list.reduce((s, o) => s + Number(o.total || 0), 0)

    const foodPic = (m) => hasPic(m)
        ? <img className="ra-food ra-food-img" src={picUrl(m)} alt="" />
        : <span className={`ra-food ${m.tone || 'pink'}`}>{m.emoji || '🍽️'}</span>

    // Add menu state
    const [addForm, setAddForm] = useState({ name: '', category: 'Korean', price: '', stock: 0, description: '', image: null })
    const [addMsg, setAddMsg] = useState('')
    const [showAdd, setShowAdd] = useState(false)

    // Account Management tabs
    const [accountTab, setAccountTab] = useState('create')

    // Rider form state
    const [riderForm, setRiderForm] = useState({ firstName: '', lastName: '', username: '', password: '', phone: '' })
    const [riderMsg, setRiderMsg] = useState('')

    // Settings state
    const [thresholdInput, setThresholdInput] = useState(settings.threshold)
    const [settingsMsg, setSettingsMsg] = useState('')

    const handleAddMenu = async () => {
        const { name, category, price, stock, description, image } = addForm
        if (!name || !Number.isFinite(Number(price)) || Number(price) <= 0 || Number(price) > 9999 || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
            return setAddMsg('Enter a food name, valid price (max ₱9,999), and whole-number stock.')
        }
        try {
            const created = await api.post('/menu', { name, category, price: Number(price), stock: Number(stock), description })
            if (image) {
                try { await api.upload(`/menu/${created.id}/image`, image) }
                catch (e) { alert('Food saved, but picture upload failed: ' + e.message) }
            }
            await refresh('admin')
            setShowAdd(false)
            setAddForm({ name: '', category: 'Korean', price: '', stock: 0, emoji: '🍽️', description: '', image: null })
            setAddMsg('')
        } catch (e) { setAddMsg(e.message) }
    }

    const handleAddRider = async () => {
        try {
            await api.post('/users/staff', riderForm)
            await loadAccounts()
            setRiderForm({ firstName: '', lastName: '', username: '', password: '', phone: '' })
            setRiderMsg('')
        } catch (e) { setRiderMsg(e.message) }
    }

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        e.target.value = ''
        if (!file || !photoForRef.current) return
        if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return alert('The picture must be a JPG, PNG or WEBP image.')
        if (file.size > 3 * 1024 * 1024) return alert('The picture is too large. Maximum size is 3 MB.')
        run(() => api.upload(`/menu/${photoForRef.current}/image`, file), 'admin')
    }

    if (loading) return <div className="empty-state">Loading...</div>
    if (error) return <div className="empty-state">Could not load data: {error}</div>

    return (
        <div className="ra-admin-body" style={{ margin: 0 }}>
            <input ref={photoInputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handlePhotoChange} />
            <div className="ra-shell">
                {/* Sidebar */}
                <aside className="ra-sidebar">
                    <div className="ra-brand">
                        <img src="/images/logo.jpg" alt="RiaGo logo" />
                        <div><b>RiaGo</b><small>Korean Food Corner</small></div>
                    </div>
                    <nav>
                        {nav.map((n) => (
                            <button key={n} className={`ra-nav${active === n ? ' active' : ''}`} onClick={() => setPage(n)}>
                                <span>{icon[n]}</span>{n}
                            </button>
                        ))}
                    </nav>
                    <div className="ra-side-bottom">
                        <div className="ra-admin-avatar">A</div>
                        <div><b>Admin</b><small>Administrator</small></div>
                        <button id="admin-logout" title="Logout" onClick={() => { if (confirm('Log out from the Admin dashboard?')) logout() }}>↪</button>
                    </div>
                </aside>

                {/* Main content */}
                <main className="ra-content">
                    <header className="ra-topbar">
                        <div><span className="ra-eyebrow">RIAGO ADMINISTRATION</span><b>{active}</b></div>
                        <div className="ra-top-user"><span>●</span> Admin</div>
                    </header>

                    <div className="ra-view">
                        {active === 'Dashboard' && (
                            <>
                                <div className="ra-welcome">
                                    <div>
                                        <span className="ra-eyebrow">RIANNE'S FOOD CORNER · ADMIN PANEL</span>
                                        <h1>Welcome Back, Admin!</h1>
                                        <p>Here's what's happening with RiaGo today.</p>
                                    </div>
                                    <div className="ra-date">▦ &nbsp; {new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                </div>
                                <div className="ra-stats">
                                    <article><div><small>Total Orders</small><strong>{orders.length}</strong><em>All recorded orders</em></div></article>
                                    <article><div><small>Total Sales</small><strong>{money(totalSales(sales))}</strong><em>Completed transactions</em></div></article>
                                    <article><div><small>Menu Items</small><strong>{menu.filter((m) => !m.archived).length}</strong><em>Active items</em></div></article>
                                    <article><div><small>Low Stock Alerts</small><strong>{low.length}</strong><em>{low.length ? 'Check inventory' : 'Stock levels look good'}</em></div></article>
                                </div>
                                <div className="ra-lower-grid">
                                    <section className="ra-card ra-recent-card">
                                        <div className="ra-card-head"><h3>▤ &nbsp; Recent Sales</h3></div>
                                        <div className="ra-table-scroll">
                                            <table className="ra-table">
                                                <thead><tr><th>Date & Time</th><th>Order #</th><th>Total</th><th>Status</th></tr></thead>
                                                <tbody>
                                                    {sales.slice().sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, 5).map((o) => (
                                                        <tr key={o.id}><td>{fmtDate(o.created)}</td><td><b>{o.number || '—'}</b></td><td>{money(o.total)}</td><td><span className={`tag ${statusClass(o.status)}`}>{o.status}</span></td></tr>
                                                    ))}
                                                    {!sales.length && <tr><td colSpan={4} className="ra-empty">No sales records yet.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                        <button className="ra-link" onClick={() => setPage('Sales Reports')}>View all sales →</button>
                                    </section>
                                    <section className="ra-card ra-low-card">
                                        <div className="ra-card-head"><h3>▣ &nbsp; Low Stock Items</h3></div>
                                        {low.length > 0
                                            ? <div className="ra-low-list">{low.slice(0, 4).map((m) => <div key={m.id}>{foodPic(m)}<b>{m.name}</b><strong>{Number(m.stock) || 0} left</strong></div>)}</div>
                                            : <p className="ra-muted">No low-stock items right now.</p>
                                        }
                                    </section>
                                </div>
                            </>
                        )}

                        {active === 'Menu Management' && (
                            <>
                                <div className="ra-page-title">
                                    <div><span className="ra-eyebrow">YOUR FOOD CATALOG</span><h1>Menu Management</h1></div>
                                    <button className="ra-primary" onClick={() => setShowAdd(!showAdd)}>＋ Add Menu Item</button>
                                </div>
                                {showAdd && (
                                    <div className="ra-card ra-form-card">
                                        <h3>Add a new menu item</h3>
                                        <div className="ra-form-grid">
                                            <label>Food name<input placeholder="e.g. Korean Cheese Corn Dog" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} /></label>
                                            <label>Category<select value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}><option>Korean</option><option>Rice Meals</option><option>Noodles</option><option>Snacks</option><option>Drinks</option><option>Other</option></select></label>
                                            <label>Price (₱)<input type="number" min={1} max={9999} step=".01" value={addForm.price} onChange={(e) => {
                                                const val = e.target.value
                                                if (val === '' || Number(val) <= 9999) setAddForm({ ...addForm, price: val })
                                            }} /></label>
                                            <label>Initial stock<input type="number" min={0} value={addForm.stock} onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })} /></label>
                                            <label>Description<input placeholder="Short food description" value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} /></label>
                                            <label>Food picture (JPG/PNG/WEBP, max 3MB)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setAddForm({ ...addForm, image: e.target.files[0] || null })} /></label>
                                        </div>
                                        {addMsg && <p className="ra-message error">{addMsg}</p>}
                                        <button className="ra-primary" onClick={handleAddMenu}>Save menu item</button>
                                        <button className="ra-secondary" onClick={() => { setShowAdd(false); setAddMsg('') }}>Cancel</button>
                                    </div>
                                )}
                                <div className="ra-card">
                                    <div className="ra-card-head"><h3>All Menu Items</h3><span className="ra-count">{menu.filter((m) => !m.archived).length} active items</span></div>
                                    <div className="ra-table-scroll">
                                        <table className="ra-table">
                                            <thead><tr><th>Food Item</th><th>Category</th><th>Price</th><th>Stock</th><th>Availability</th><th>Actions</th></tr></thead>
                                            <tbody>
                                                {menu.filter((m) => !m.archived).map((m) => (
                                                    <tr key={m.id}>
                                                        <td><span className="ra-menu-name">{foodPic(m)}<b>{m.name}</b></span></td>
                                                        <td>{m.category || 'Other'}</td>
                                                        <td>{money(m.price)}</td>
                                                        <td>{Number(m.stock) || 0}</td>
                                                        <td><span className={`ra-status ${m.available ? 'on' : 'off'}`}>{m.available ? 'Available' : 'Unavailable'}</span></td>
                                                        <td>
                                                            <button className="ra-small" onClick={() => {
                                                                const name = prompt('Food name:', m.name); if (!name) return
                                                                const price = prompt('Price (₱):', m.price); if (!price) return
                                                                const category = prompt('Category:', m.category || 'Other'); if (!category) return
                                                                const desc = prompt('Description:', m.desc || ''); if (desc === null) return
                                                                const n = Number(price)
                                                                if (!name.trim() || !Number.isFinite(n) || n <= 0) return alert('Enter a valid name and price.')
                                                                run(() => api.put(`/menu/${m.id}`, { name: name.trim(), price: n, category: category.trim() || 'Other', description: desc.trim(), emoji: m.emoji }), 'admin')
                                                            }}>Edit</button>
                                                            <button className="ra-small" onClick={() => { photoForRef.current = m.id; photoInputRef.current?.click() }}>Photo</button>
                                                            <button className="ra-small" onClick={() => run(() => api.patch(`/menu/${m.id}/availability`, { is_available: !m.available }), 'admin')}>{m.available ? 'Disable' : 'Enable'}</button>
                                                            <button className="ra-small danger" onClick={() => { if (confirm(`Archive ${m.name}?`)) run(() => api.patch(`/menu/${m.id}/archive`, { archived: true }), 'admin') }}>Archive</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {!menu.filter((m) => !m.archived).length && <tr><td colSpan={6} className="ra-empty">No active menu items.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="ra-card">
                                    <div className="ra-card-head"><h3>Archived Items</h3></div>
                                    <div className="ra-archived">
                                        {menu.filter((m) => m.archived).map((m) => (
                                            <div key={m.id}><span>{foodPic(m)} {m.name}</span><button className="ra-small" onClick={() => run(() => api.patch(`/menu/${m.id}/archive`, { archived: false }), 'admin')}>Restore</button></div>
                                        ))}
                                        {!menu.filter((m) => m.archived).length && <p className="ra-muted">No archived menu items.</p>}
                                    </div>
                                </div>
                            </>
                        )}

                        {active === 'Inventory Management' && (
                            <>
                                <div className="ra-page-title">
                                    <div><span className="ra-eyebrow">STOCK CONTROL</span><h1>Inventory Management</h1></div>
                                    <span className="ra-count">Alert level: {settings.threshold} or below</span>
                                </div>
                                <div className="ra-card">
                                    <div className="ra-card-head"><h3>Inventory List</h3><span className="ra-count">{low.length} low-stock alerts</span></div>
                                    <div className="ra-table-scroll">
                                        <table className="ra-table">
                                            <thead><tr><th>Item</th><th>Current Stock</th><th>Stock Status</th><th>Update Quantity</th></tr></thead>
                                            <tbody>
                                                {menu.filter((m) => !m.archived).map((m) => (
                                                    <tr key={m.id}>
                                                        <td><span className="ra-menu-name">{foodPic(m)}<b>{m.name}</b></span></td>
                                                        <td><b>{Number(m.stock) || 0}</b></td>
                                                        <td><span className={`ra-status ${Number(m.stock) <= settings.threshold ? 'off' : 'on'}`}>{Number(m.stock) <= settings.threshold ? 'Low Stock' : 'In Stock'}</span></td>
                                                        <td><button className="ra-small" onClick={() => {
                                                            const v = prompt(`New stock quantity for ${m.name}:`, m.stock)
                                                            if (v === null) return
                                                            if (!Number.isInteger(Number(v)) || Number(v) < 0) return alert('Enter a valid whole number.')
                                                            run(() => api.patch(`/menu/${m.id}/stock`, { stock: Number(v) }), 'admin')
                                                        }}>Update Stock</button></td>
                                                    </tr>
                                                ))}
                                                {!menu.filter((m) => !m.archived).length && <tr><td colSpan={4} className="ra-empty">No menu items available.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="ra-card">
                                    <div className="ra-card-head"><h3>Low Stock Alerts</h3></div>
                                    {low.map((m) => <div key={m.id} className="ra-alert-row"><b>{m.name}</b><span>{Number(m.stock) || 0} remaining</span></div>)}
                                    {!low.length && <p className="ra-muted">Everything is above the alert level.</p>}
                                </div>
                            </>
                        )}

                        {active === 'Sales Reports' && (
                            <>
                                <div className="ra-page-title">
                                    <div><span className="ra-eyebrow">BUSINESS PERFORMANCE</span><h1>Sales Reports</h1></div>
                                    <button className="ra-secondary" onClick={() => {
                                        const rows = [['Date', 'Order Number', 'Type', 'Total', 'Status'], ...sales.map((o) => [o.created, o.number, o.type, o.total, o.status])]
                                        const csv = rows.map((r) => r.map((v) => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')).join('\n')
                                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                                        const url = URL.createObjectURL(blob)
                                        const a = document.createElement('a'); a.href = url; a.download = 'riago-sales-report.csv'; a.click(); URL.revokeObjectURL(url)
                                    }}>↓ Export CSV</button>
                                </div>
                                <div className="ra-card">
                                    <div className="ra-card-head"><h3>Completed Transactions</h3><span className="ra-count">{sales.length} records</span></div>
                                    <div className="ra-table-scroll">
                                        <table className="ra-table">
                                            <thead><tr><th>Date</th><th>Order #</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
                                            <tbody>
                                                {sales.slice().sort((a, b) => new Date(b.created) - new Date(a.created)).map((o) => (
                                                    <tr key={o.id}><td>{fmtDate(o.created)}</td><td><b>{o.number || '—'}</b></td><td>{o.type || '—'}</td><td>{money(o.total)}</td><td><span className={`tag ${statusClass(o.status)}`}>{o.status}</span></td></tr>
                                                ))}
                                                {!sales.length && <tr><td colSpan={5} className="ra-empty">No completed sales yet.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {active === 'Account Management' && (
                            <>
                                <div className="ra-page-title">
                                    <div><span className="ra-eyebrow">REGISTERED USERS</span><h1>Account Management</h1></div>
                                </div>

                                {/* 3 Tabs */}
                                <div className="cx-tabs" style={{ marginBottom: 20 }}>
                                    <button className={`cx-tab${accountTab === 'create' ? ' on' : ''}`} onClick={() => setAccountTab('create')}>
                                        Create Rider
                                    </button>
                                    <button className={`cx-tab${accountTab === 'riders' ? ' on' : ''}`} onClick={() => setAccountTab('riders')}>
                                        Rider Accounts <b>{staffList.length}</b>
                                    </button>
                                    <button className={`cx-tab${accountTab === 'customers' ? ' on' : ''}`} onClick={() => setAccountTab('customers')}>
                                        Customer Accounts <b>{customerList.length}</b>
                                    </button>
                                </div>

                                {/* Tab: Create Rider */}
                                {accountTab === 'create' && (
                                    <div className="ra-card">
                                        <div className="ra-card-head"><h3>Create Rider Account</h3></div>
                                        <div className="ra-form-grid">
                                            <label>First name<input placeholder="First name" value={riderForm.firstName} onChange={(e) => setRiderForm({ ...riderForm, firstName: e.target.value })} /></label>
                                            <label>Last name<input placeholder="Last name" value={riderForm.lastName} onChange={(e) => setRiderForm({ ...riderForm, lastName: e.target.value })} /></label>
                                            <label>Username<input placeholder="Username" value={riderForm.username} onChange={(e) => setRiderForm({ ...riderForm, username: e.target.value })} /></label>
                                            <label>Password<input type="password" placeholder="At least 6 characters" value={riderForm.password} onChange={(e) => setRiderForm({ ...riderForm, password: e.target.value })} /></label>
                                            <label>Contact number<input type="tel" inputMode="numeric" maxLength={11} placeholder="09XXXXXXXXX" value={riderForm.phone} onChange={(e) => setRiderForm({ ...riderForm, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })} /></label>
                                        </div>
                                        {riderMsg && <p className="ra-message error">{riderMsg}</p>}
                                        <button className="ra-primary" onClick={handleAddRider}>Create Rider Account</button>
                                    </div>
                                )}

                                {/* Tab: Rider Accounts */}
                                {accountTab === 'riders' && (
                                    <div className="ra-card">
                                        <div className="ra-card-head"><h3>Rider Accounts</h3><span className="ra-count">{staffList.length} riders</span></div>
                                        {staffList.length > 0 ? (
                                            <div className="ra-table-scroll">
                                                <table className="ra-table">
                                                    <thead><tr><th>Name</th><th>Username</th><th>Contact</th><th>Action</th></tr></thead>
                                                    <tbody>
                                                        {staffList.map((r) => (
                                                            <tr key={r.id}>
                                                                <td><b>{r.full_name}</b></td>
                                                                <td>@{r.username}</td>
                                                                <td>{r.phone || '—'}</td>
                                                                <td>
                                                                    <button className="ra-small danger" onClick={async () => {
                                                                        if (!confirm('Remove this rider account?')) return
                                                                        try { await api.del(`/users/staff/${r.id}`); await loadAccounts() } catch (e) { alert(e.message) }
                                                                    }}>Remove</button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : <p className="ra-muted">No rider accounts yet.</p>}
                                    </div>
                                )}

                                {/* Tab: Customer Accounts */}
                                {accountTab === 'customers' && (
                                    <div className="ra-card">
                                        <div className="ra-card-head"><h3>Customer Accounts</h3><span className="ra-count">{customerList.length} registered</span></div>
                                        <div className="ra-table-scroll">
                                            <table className="ra-table">
                                                <thead><tr><th>Name</th><th>Email</th><th>Contact</th><th>Address</th></tr></thead>
                                                <tbody>
                                                    {customerList.map((c) => (
                                                        <tr key={c.id}>
                                                            <td><b>{c.full_name}</b></td>
                                                            <td>{c.email}</td>
                                                            <td>{c.phone || '—'}</td>
                                                            <td>{c.address || '—'}</td>
                                                        </tr>
                                                    ))}
                                                    {!customerList.length && <tr><td colSpan={4} className="ra-empty">No customer accounts yet.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {active === 'Settings' && (
                            <>
                                <div className="ra-page-title"><div><span className="ra-eyebrow">PREFERENCES</span><h1>Settings</h1></div></div>
                                <div className="ra-card ra-settings">
                                    <h3>Inventory Alerts</h3>
                                    <p>Show a low-stock alert when an item's stock reaches this quantity or lower.</p>
                                    <label>Low stock threshold<input type="number" min={0} step={1} value={thresholdInput} onChange={(e) => setThresholdInput(e.target.value)} /></label>
                                    <button className="ra-primary" onClick={() => {
                                        const n = Number(thresholdInput)
                                        if (!Number.isInteger(n) || n < 0) return setSettingsMsg('Enter a whole number zero or higher.')
                                        const updated = { ...settings, threshold: n }
                                        setSettings(updated)
                                        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
                                        setSettingsMsg('Preferences saved.')
                                    }}>Save Preferences</button>
                                    {settingsMsg && <p className={`ra-message${settingsMsg.includes('saved') ? ' success' : ' error'}`}>{settingsMsg}</p>}
                                </div>
                                <div className="ra-card ra-settings">
                                    <h3>Store Information</h3>
                                    <p><b>Business:</b> Rianne's Food Corner</p>
                                    <p><b>System:</b> RiaGo</p>
                                    <p><b>Data storage:</b> MySQL database</p>
                                </div>
                            </>
                        )}
                    </div>

                    <footer className="ra-footer">© {new Date().getFullYear()} RiaGo · Rianne's Food Corner</footer>
                </main>
            </div>
        </div>
    )
}

export default AdminPage
