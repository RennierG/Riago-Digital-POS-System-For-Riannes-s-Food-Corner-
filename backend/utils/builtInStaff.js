import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

// Cashier and Kitchen have built-in accounts (no need for the admin to create them).
export const builtInStaff = () => [
  { role: 'cashier', name: 'Cashier', username: (process.env.CASHIER_USERNAME || 'cashier').trim().toLowerCase(), password: process.env.CASHIER_PASSWORD || 'cashier123' },
  { role: 'kitchen', name: 'Kitchen', username: (process.env.KITCHEN_USERNAME || 'kitchen').trim().toLowerCase(), password: process.env.KITCHEN_PASSWORD || 'kitchen123' }
];

export async function ensureBuiltInStaff() {
  for (const staff of builtInStaff()) {
    const [rows] = await pool.execute('SELECT id, role, password_hash FROM users WHERE username = ? LIMIT 1', [staff.username]);
    if (!rows.length) {
      await pool.execute(
        'INSERT INTO users (full_name, username, password_hash, role, is_verified) VALUES (?, ?, ?, ?, 1)',
        [staff.name, staff.username, await bcrypt.hash(staff.password, 10), staff.role]
      );
    } else if (rows[0].role === staff.role && !(await bcrypt.compare(staff.password, rows[0].password_hash))) {
      await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(staff.password, 10), rows[0].id]);
    }
  }
}
