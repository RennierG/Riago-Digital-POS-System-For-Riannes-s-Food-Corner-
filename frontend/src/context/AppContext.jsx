import { createContext, useContext, useState, useCallback } from 'react'
import { useAuth } from './AuthContext.jsx'

const AppContext = createContext(null)

const BASE_URL = ''

const STATUS = {
    placed: 'Order Placed',
    in_process: 'Order in Process',
    out_for_delivery: 'Out for Delivery',
    complete: 'Order Complete',
    rejected: 'Rejected',
    failed: 'Failed'
}

const PREP = {
    new: 'New',
    preparing: 'Preparing',
    ready: 'Ready',
    completed: 'Completed'
}

const mapMenu = (m) => ({
    id: m.id, name: m.name, price: Number(m.price), available: !!m.is_available,
    stock: Number(m.stock), category: m.category, emoji: m.emoji, desc: m.description,
    tone: m.tone, image: m.image_path || '', archived: !!m.is_archived
})

const mapOrder = (o) => ({
    id: o.id, number: o.order_number,
    type: o.order_type === 'online' ? 'Online' : 'Counter',
    customerId: o.customer_id, customer: o.customer_name,
    address: o.delivery_address, contact: o.customer_phone,
    items: (o.items || []).map((i) => ({ id: i.menu_item_id, name: i.name, price: Number(i.price), qty: i.qty })),
    total: Number(o.total_amount), status: STATUS[o.status], prep: PREP[o.kitchen_status],
    rider: o.rider_name || '', riderId: o.rider_id,
    received: o.amount_received, change: o.change_amount, created: o.created_at
})

export const AppProvider = ({ children }) => {
    const { logout } = useAuth()
    const [menu, setMenu] = useState([])
    const [orders, setOrders] = useState([])
    const [riderList, setRiderList] = useState([])
    const [customerList, setCustomerList] = useState([])
    const [staffList, setStaffList] = useState([])

    const request = useCallback(async (path, options = {}) => {
        const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
        const token = sessionStorage.getItem('riago_api_token_v1')
        if (token) headers.Authorization = `Bearer ${token}`
        let response
        try {
            response = await fetch(`${BASE_URL}${path}`, { ...options, headers })
        } catch {
            throw new Error('Cannot reach the RiaGo server. Make sure it is running.')
        }
        const data = await response.json().catch(() => ({}))
        if (response.status === 401 && token && !/^\/auth\/(login|register)/.test(path)) { logout(); return }
        if (!response.ok) throw new Error(data.error || data.message || 'The request could not be completed.')
        return data.message !== undefined ? data.message : data
    }, [logout])

    const send = (method) => (path, body) => request(path, { method, body: body === undefined ? undefined : JSON.stringify(body) })
    const upload = (path, file) => request(path, { method: 'POST', headers: { 'Content-Type': file.type }, body: file })

    const api = {
        get: (path) => request(path),
        post: send('POST'), put: send('PUT'), patch: send('PATCH'),
        del: (path) => request(path, { method: 'DELETE' }), upload
    }

    const refresh = useCallback(async (role) => {
        if (role === 'customer') {
            const [menuData, ordersData] = await Promise.all([api.get('/menu'), api.get('/orders/mine')])
            setMenu((menuData || []).map(mapMenu)); setOrders((ordersData || []).map(mapOrder).reverse())
        } else if (role === 'cashier') {
            const [menuData, ordersData, riders] = await Promise.all([api.get('/menu'), api.get('/orders'), api.get('/users/riders')])
            setMenu((menuData || []).map(mapMenu)); setOrders((ordersData || []).map(mapOrder).reverse()); setRiderList(riders || [])
        } else if (role === 'admin') {
            const [menuData, ordersData] = await Promise.all([api.get('/menu/admin'), api.get('/orders')])
            setMenu((menuData || []).map(mapMenu)); setOrders((ordersData || []).map(mapOrder).reverse())
        } else {
            const ordersData = await api.get('/orders')
            setMenu([]); setOrders((ordersData || []).map(mapOrder).reverse())
        }
    }, [])

    const loadAccounts = useCallback(async () => {
        const [customers, staff] = await Promise.all([api.get('/users/customers'), api.get('/users/staff')])
        setCustomerList(customers || []); setStaffList(staff || [])
    }, [])

    const run = useCallback(async (action, role) => {
        try { await action() } catch (e) { alert(e.message) }
        try { await refresh(role) } catch (e) { alert(e.message) }
    }, [refresh])

    const money = (n) => '₱' + Number(n || 0).toFixed(2)
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
    const statusClass = (s) => ['Order Complete', 'Ready', 'Delivered'].includes(s) ? 'ok' : ['Rejected', 'Failed', 'Cancelled'].includes(s) ? 'no' : 'wn'
    const CUSTOMER_LABEL = { 'Order Placed': 'Order Placed', 'Order in Process': 'Processing', 'Out for Delivery': 'Out for Delivery', 'Order Complete': 'Delivered' }
    const picUrl = (m) => '/' + String(m.image || '').replace(/^\/+/, '')
    const hasPic = (m) => !!m.image
    const ago = (iso) => { const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000)); if (mins < 1) return 'just now'; if (mins < 60) return `${mins} min ago`; if (mins < 1440) return `${Math.floor(mins / 60)} h ago`; return `${Math.floor(mins / 1440)} d ago` }
    const chipClass = (s) => ({ 'Order Placed': 'wait', 'Order in Process': 'prog', 'Order Complete': 'ok', 'Rejected': 'no', 'Failed': 'no', 'Cancelled': 'no', 'New': 'wait', 'Preparing': 'prog', 'Ready': 'ok', 'Completed': 'ok' }[s] || 'wait')
    const chipLabel = (s) => ({ 'Order Placed': 'New request', 'Order in Process': 'In process' }[s] || s)

    return (
        <AppContext.Provider value={{
            menu, orders, riderList, customerList, staffList,
            setCustomerList, setStaffList, setRiderList,
            api, refresh, loadAccounts, run,
            money, esc, statusClass, CUSTOMER_LABEL, picUrl, hasPic, ago, chipClass, chipLabel,
            STATUS, PREP, mapMenu, mapOrder
        }}>
            {children}
        </AppContext.Provider>
    )
}

export const useApp = () => useContext(AppContext)
