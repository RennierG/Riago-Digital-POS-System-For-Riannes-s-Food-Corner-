import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'Please log in first.' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch (e) {
        return res.status(401).json({ error: 'Your session is invalid or expired. Please log in again.' });
    }
}

export const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'You do not have permission to perform this action.' });
        }
        return next();
    };
}
