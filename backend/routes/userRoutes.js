import express from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth, allowRoles } from '../middleware/auth.js';

const userRoutes = express.Router();

userRoutes.get('/customers', requireAuth, allowRoles('admin'), userController.customers);
userRoutes.get('/staff', requireAuth, allowRoles('admin'), userController.staff);
userRoutes.post('/staff', requireAuth, allowRoles('admin'), userController.createStaff);
userRoutes.delete('/staff/:id', requireAuth, allowRoles('admin'), userController.removeStaff);
userRoutes.get('/riders', requireAuth, allowRoles('admin', 'cashier'), userController.riders);

export default userRoutes;
