import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import * as userModel from '../models/userModel.js';
import * as pendingModel from '../models/pendingRegistrationModel.js';
import { sendRegistrationOtp } from '../utils/email.js';
import { HttpError } from '../utils/httpError.js';

const MAX_OTP_ATTEMPTS = 5;
const clean = (value) => String(value || '').trim();
const normalizeEmail = (value) => clean(value).toLowerCase();

// Step 1: create a pending registration and email a one-time code.
export const requestRegistrationOtp = async (body) => {
    const firstName = clean(body.firstName);
    const lastName = clean(body.lastName);
    const name = `${firstName} ${lastName}`.trim();
    const email = normalizeEmail(body.email);
    const phone = clean(body.phone);
    const barangayStreet = clean(body.barangayStreet);
    const city = clean(body.city);
    const province = clean(body.province);
    const address = [barangayStreet, city, province].filter(Boolean).join(', ');
    const password = String(body.password || '');

    if (!firstName || !lastName) throw new HttpError(400, 'First name and last name are required.');
    if (!email || !phone || !password) throw new HttpError(400, 'Email, contact number, and password are required.');
    if (!/^\d{11}$/.test(phone)) throw new HttpError(400, 'Contact number must be exactly 11 digits.');
    if (!barangayStreet || !city || !province) throw new HttpError(400, 'Barangay/street, city/municipality, and province are required.');
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, 'Enter a valid email address.');
    if (password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters.');
    if (await userModel.findByEmail(email)) throw new HttpError(409, 'That email is already registered.');

    const otp = String(crypto.randomInt(100000, 1000000));
    const expiresMinutes = Math.max(1, Number(process.env.OTP_EXPIRES_MINUTES || 5));

    const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(12));
    const otpHash = await bcrypt.hash(otp, await bcrypt.genSalt(10));

    await pendingModel.upsert({ email, fullName: name, phone, address, passwordHash, otpHash, expiresMinutes });

    await sendRegistrationOtp(email, name, otp);

    return {
        message: 'A verification code has been sent to your email. It expires in a few minutes.',
        expiresInMinutes: expiresMinutes
    };
}

// Step 2: only a correct, unexpired code creates the customer account.
export const verifyRegistrationOtp = async (body) => {
    const email = normalizeEmail(body.email);
    const otp = clean(body.otp);

    if (!email || !/^\d{6}$/.test(otp)) throw new HttpError(400, 'Enter the 6-digit code sent to your email.');

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const pending = await pendingModel.findForUpdate(email, connection);

        if (!pending) { await connection.rollback(); throw new HttpError(400, 'No pending registration was found. Please request a new code.'); }
        if (pending.is_expired) { await pendingModel.remove(email, connection); await connection.commit(); throw new HttpError(400, 'The code has expired. Please register again.'); }
        if (pending.attempts >= MAX_OTP_ATTEMPTS) { await connection.rollback(); throw new HttpError(429, 'Too many incorrect attempts. Tap "Resend code" to get a new one.'); }

        if (!(await bcrypt.compare(otp, pending.otp_hash))) {
            await pendingModel.addAttempt(email, connection);
            await connection.commit();
            const left = Math.max(0, MAX_OTP_ATTEMPTS - (pending.attempts + 1));
            throw new HttpError(400, left ? `Incorrect verification code. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many attempts, tap "Resend code".');
        }

        const id = await userModel.insertCustomer({ fullName: pending.full_name, email: pending.email, phone: pending.phone, address: pending.address, passwordHash: pending.password_hash }, connection);
        await pendingModel.remove(email, connection);
        await connection.commit();

        return {
            message: 'Email verified. Your account has been created.',
            token: null, // token added in task 1.1.2
            user: { id, name: pending.full_name, email, role: 'customer', phone: pending.phone, address: pending.address }
        };
    } catch (error) {
        await connection.rollback().catch(() => {});
        throw error;
    } finally {
        connection.release();
    }
}
