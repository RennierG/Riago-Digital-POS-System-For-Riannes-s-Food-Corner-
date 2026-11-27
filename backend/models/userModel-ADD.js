// === ADD THESE FUNCTIONS to backend/models/userModel.js ===

export const findCustomerByEmail = async (email) => {
    const [rows] = await pool.execute(
        "SELECT * FROM users WHERE email = ? AND role = 'customer' LIMIT 1",
        [email]
    );
    return rows[0] || null;
}
