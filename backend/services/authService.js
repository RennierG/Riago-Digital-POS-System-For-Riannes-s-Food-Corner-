// === ADD ONLY: Paste these functions into backend/services/authService.js ===
// Add after the verifyRegistrationOtp function (before the closing of the file).

// ---- ADD: makeToken and customerToken helpers ----
// (Move these to the top of the file, before requestRegistrationOtp, as shared helpers)
const makeToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
}

const customerToken = (user) => {
    return makeToken({ id: user.id, name: user.full_name, role: user.role });
}

// ---- ADD: loginCustomer function ----
/*======1.0 Rennier =======*/
export const loginCustomer = async (body) => {
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');

    const user = await userModel.findCustomerByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        throw new HttpError(401, 'Incorrect email or password.');
    }

    if (!user.is_verified) {
        throw new HttpError(403, 'Please verify your email before logging in.');
    }

    return {
        message: 'Login successful.',
        token: customerToken(user),
        user: { id: user.id, name: user.full_name, email: user.email, role: user.role, phone: user.phone, address: user.address }
    };
}
