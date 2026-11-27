import pool from '../config/db.js';

const COLUMNS = 'id, name, description, category, price, stock, emoji, tone, image_path, is_available, is_archived';

export const fetchAll = async ({ includeArchived = false } = {}) => {
    const [rows] = await pool.execute(
        `SELECT ${COLUMNS} FROM menu_items ${includeArchived ? '' : 'WHERE is_archived = 0'} ORDER BY category, name`
    );
    return rows;
}

export const findById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT ${COLUMNS} FROM menu_items WHERE id = ?`,
        [id]
    );
    return rows[0] || null;
}

export const insert = async ({ name, description, category, price, stock, emoji, tone, imagePath }) => {
    const [result] = await pool.execute(
        'INSERT INTO menu_items (name, description, category, price, stock, emoji, tone, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, description, category, price, stock, emoji, tone, imagePath]
    );
    return result.insertId;
}

export const update = async (id, { name, description, category, price, emoji }) => {
    const [result] = await pool.execute(
        'UPDATE menu_items SET name = ?, description = ?, category = ?, price = ?, emoji = ? WHERE id = ?',
        [name, description, category, price, emoji, id]
    );
    return result.affectedRows;
}

export const setAvailability = async (id, available) => {
    const [result] = await pool.execute(
        'UPDATE menu_items SET is_available = ? WHERE id = ?',
        [available ? 1 : 0, id]
    );
    return result.affectedRows;
}

export const setImage = async (id, imagePath) => {
    const [result] = await pool.execute(
        'UPDATE menu_items SET image_path = ? WHERE id = ?',
        [imagePath, id]
    );
    return result.affectedRows;
}

export const setStock = async (id, stock) => {
    const [result] = await pool.execute(
        'UPDATE menu_items SET stock = ? WHERE id = ?',
        [stock, id]
    );
    return result.affectedRows;
}

export const setArchived = async (id, archived) => {
    // Archiving also hides the item from customers; restoring makes it available again.
    const [result] = await pool.execute(
        'UPDATE menu_items SET is_archived = ?, is_available = ? WHERE id = ?',
        [archived ? 1 : 0, archived ? 0 : 1, id]
    );
    return result.affectedRows;
}

// --- used inside order transactions (db is a connection) ---
export const findForUpdate = async (id, db) => {
    const [rows] = await db.execute(
        'SELECT id, name, price, stock, is_available, is_archived FROM menu_items WHERE id = ? FOR UPDATE',
        [id]
    );
    return rows[0] || null;
}

export const reduceStock = async (id, quantity, db) => {
    await db.execute(
        'UPDATE menu_items SET stock = stock - ? WHERE id = ?',
        [quantity, id]
    );
}
