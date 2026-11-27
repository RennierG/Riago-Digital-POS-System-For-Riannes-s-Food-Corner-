// === ADD THESE LINES to backend/routes/authRoutes.js ===
// Add these imports at the top:
import { requireAuth } from '../middleware/auth.js';

// Add these routes BEFORE the authRoutes.use(limiter(30)) line:
authRoutes.get('/me', requireAuth, authController.me);

// Add these routes AFTER the existing register routes:
authRoutes.post('/login/customer', authController.loginCustomer);
