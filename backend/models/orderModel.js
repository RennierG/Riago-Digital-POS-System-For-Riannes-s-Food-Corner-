import pool from '../config/db.js';

export const insertOrder = async ({ orderType, customerId, customerName, customerPhone, address, total, amountReceived, changeAmount, status, kitchenStatus }, db) => {
    const [result] = await db.execute(
        `INSERT INTO orders (order_number, order_type, customer_id, customer_name, customer_phone, delivery_address, total_amount, amount_received, change_amount, status, kitchen_status)
         VALUES (CONCAT('TMP-', UUID_SHORT()), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderType, customerId, customerName, customerPhone, address, total, amountReceived, changeAmount, status, kitchenStatus]
    );
    return result.insertId;
}

export const setOrderNumber = async (id, number, db) => {
    await db.execute(
        'UPDATE orders SET order_number = ? WHERE id = ?',
        [number, id]
    );
}

export const insertItem = async ({ orderId, menuItemId, name, price, quantity }, db) => {
    await db.execute(
        'INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price, quantity, line_total) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, menuItemId, name, price, quantity, Math.round(Number(price) * quantity * 100) / 100]
    );
}

const SELECT_ORDER = `SELECT o.*, r.full_name AS rider_name FROM orders o LEFT JOIN users r ON r.id = o.rider_id`;

async function attachItems(rows) {
    if (!rows.length) return rows;
    const marks = rows.map(() => '?').join(',');
    const [items] = await pool.execute(
        `SELECT order_id, menu_item_id, item_name, unit_price, quantity FROM order_items WHERE order_id IN (${marks}) ORDER BY id`,
        rows.map((r) => r.id)
    );
    const byOrder = new Map(rows.map((r) => [r.id, []]));
    items.forEach((i) => byOrder.get(i.order_id).push({
        menu_item_id: i.menu_item_id,
        name: i.item_name,
        price: i.unit_price,
        qty: i.quantity
    }));
    return rows.map((r) => ({ ...r, items: byOrder.get(r.id) }));
}

export const fetchByCustomer = async (customerId) => {
    const [rows] = await pool.execute(
        `${SELECT_ORDER} WHERE o.customer_id = ? ORDER BY o.created_at DESC, o.id DESC`,
        [customerId]
    );
    return attachItems(rows);
}

export const fetchAll = async ({ riderId = null } = {}) => {
    const [rows] = riderId === null
        ? await pool.execute(`${SELECT_ORDER} ORDER BY o.created_at DESC, o.id DESC`)
        : await pool.execute(`${SELECT_ORDER} WHERE o.rider_id = ? ORDER BY o.created_at DESC, o.id DESC`, [riderId]);
    return attachItems(rows);
}

export const findForUpdate = async (id, db) => {
    const [rows] = await db.execute(
        'SELECT * FROM orders WHERE id = ? FOR UPDATE',
        [id]
    );
    return rows[0] || null;
}

export const fetchItemsOf = async (orderId, db) => {
    const [rows] = await db.execute(
        'SELECT menu_item_id, item_name, quantity FROM order_items WHERE order_id = ? ORDER BY menu_item_id',
        [orderId]
    );
    return rows;
}

export const updateFields = async (id, fields, db) => {
    const keys = Object.keys(fields);
    await db.execute(
        `UPDATE orders SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`,
        [...keys.map((k) => fields[k]), id]
    );
}
