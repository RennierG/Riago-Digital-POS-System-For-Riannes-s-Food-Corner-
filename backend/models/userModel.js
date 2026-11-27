import pool from '../config/db.js';

export const findByEmail = async (email) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
}

export const insertCustomer = async ({ fullName, email, phone, address, passwordHash }, db = pool) => {
    const [result] = await db.execute(
        `INSERT INTO users (full_name, email, phone, address, password_hash, role, is_verified)
         VALUES (?, ?, ?, ?, ?, 'customer', 1)`,
        [fullName, email, phone, address, passwordHash]
    );
    return result.insertId;
}
