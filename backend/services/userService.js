import bcrypt from 'bcryptjs';
import * as userModel from '../models/userModel.js';
import { HttpError } from '../utils/httpError.js';
import { clean, toId, toPhone } from '../utils/validate.js';
import { builtInStaff } from '../utils/builtInStaff.js';

// Cashier and Kitchen are built in; the admin only creates riders.

export const customers = () => {
    return userModel.listCustomers();
}

export const staff = () => {
    return userModel.listStaff(['rider']);
}

export const riders = () => {
    return userModel.listStaff(['rider']);
}

export const createStaff = async (body) => {
    const firstName = clean(body.firstName);
    const lastName = clean(body.lastName);
    const username = clean(body.username).toLowerCase();
    const password = String(body.password || '');

    if (!firstName || !lastName) {
        throw new HttpError(400, 'First name and last name are required.');
    }

    if (!/^[a-z0-9_.]{3,30}$/.test(username)) {
        throw new HttpError(400, 'Username must be 3-30 letters, numbers, dots or underscores.');
    }

    const reserved = [
        String(process.env.ADMIN_USERNAME || '').toLowerCase(),
        ...builtInStaff().map((b) => b.username)
    ];

    if (reserved.includes(username)) {
        throw new HttpError(409, 'That username is reserved.');
    }

    if (password.length < 6) {
        throw new HttpError(400, 'Password must be at least 6 characters.');
    }

    const phone = toPhone(body.phone);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    try {
        const id = await userModel.insertStaff({
            fullName: `${firstName} ${lastName}`,
            username,
            phone,
            passwordHash,
            role: 'rider'
        });
        return { id, full_name: `${firstName} ${lastName}`, username, phone, role: 'rider' };
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
            throw new HttpError(409, 'That username is already taken.');
        }
        throw e;
    }
}

export const removeStaff = async (id) => {
    const deleted = await userModel.deleteStaff(toId(id));
    if (!deleted) {
        throw new HttpError(404, 'Staff account not found.');
    }
    return { message: 'Account removed.' };
}
