import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pool from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { ensureBuiltInStaff } from './utils/builtInStaff.js';

const PORT = Number(process.env.PORT || 3000);

let corsOptions = {
    origin: process.env.FRONTEND_ORIGIN || `http://localhost:5173`
};

// create express app
const app = express();

// middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// serve uploaded food images (images/menu/)
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
app.use('/images', express.static(path.join(projectRoot, 'images')));

// --- API routes
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ success: true, message: 'RiaGo API is running.' });
    } catch (e) {
        console.log(e);
        res.status(503).json({ error: 'Cannot connect to database.' });
    }
});

// NOTE: Route imports will be added per task:
// import authRoutes from './routes/authRoutes.js';   <- task 1.1.1
// import menuRoutes from './routes/menuRoutes.js';   <- task 2.1.1
// import orderRoutes from './routes/orderRoutes.js'; <- task 2.3.1
// import userRoutes from './routes/userRoutes.js';   <- task 1.2.1

app.use(notFound);
app.use(errorHandler);

// --- Startup checks
const requireEnv = () => {
    const { ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET } = process.env;
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
        console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD in backend/.env before starting RiaGo.');
        process.exit(1);
    }
    if (!JWT_SECRET) {
        console.error('Set a JWT_SECRET in backend/.env before starting RiaGo.');
        process.exit(1);
    }
}

requireEnv();

try {
    await pool.query('SELECT 1');
    await ensureBuiltInStaff();
    app.listen(PORT, () => {
        console.log(`RiaGo backend is running at http://localhost:${PORT}`);
    });
} catch (e) {
    console.error('Cannot connect to MySQL. Start MySQL in XAMPP and check backend/.env.', e.message);
    process.exit(1);
}
