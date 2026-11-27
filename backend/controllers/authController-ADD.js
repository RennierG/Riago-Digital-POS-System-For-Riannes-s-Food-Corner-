// === ADD THESE to backend/controllers/authController.js ===

export const loginCustomer = async (req, res) => {
    try {
        const result = await authService.loginCustomer(req.body);
        res.status(200).json({ success: true, message: result });
    } catch (e) {
        console.log(e);
        res.status(e.statusCode || 500).json({ error: `${e.message || 'Internal Server Error'}` });
    }
}

export const me = (req, res) => {
    res.status(200).json({ success: true, message: { user: req.user } });
}
