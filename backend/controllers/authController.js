import * as authService from '../services/authService.js';

export const requestOtp = async (req, res) => {
    try {
        const result = await authService.requestRegistrationOtp(req.body);
        res.status(200).json({ success: true, message: result });
    } catch (e) {
        console.log(e);
        res.status(e.statusCode || 500).json({ error: `${e.message || 'Internal Server Error'}` });
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const result = await authService.verifyRegistrationOtp(req.body);
        res.status(201).json({ success: true, message: result });
    } catch (e) {
        console.log(e);
        res.status(e.statusCode || 500).json({ error: `${e.message || 'Internal Server Error'}` });
    }
}
