import pool from '../config/db.js';

export const upsert = async ({ email, fullName, phone, address, passwordHash, otpHash, expiresMinutes }, db = pool) => {
    await db.execute(
        `INSERT INTO pending_registrations (email, full_name, phone, address, password_hash, otp_hash, expires_at, attempts)
         VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), 0)
         ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), phone=VALUES(phone), address=VALUES(address),
         password_hash=VALUES(password_hash), otp_hash=VALUES(otp_hash), expires_at=VALUES(expires_at), attempts=0`,
        [email, fullName, phone, address || null, passwordHash, otpHash, expiresMinutes]
    );
}

export const findForUpdate = async (email, db = pool) => {
    const [rows] = await db.execute(
        'SELECT *, (expires_at < NOW()) AS is_expired FROM pending_registrations WHERE email = ? FOR UPDATE',
        [email]
    );
    return rows[0] || null;
}

export const remove = async (email, db = pool) => {
    await db.execute(
        'DELETE FROM pending_registrations WHERE email = ?',
        [email]
    );
}

export const addAttempt = async (email, db = pool) => {
    await db.execute(
        'UPDATE pending_registrations SET attempts = attempts + 1 WHERE email = ?',
        [email]
    );
}
