import express from 'express';
import { deleteUser, getUsers, loginAdmin } from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/users', protectAdmin, getUsers);
router.delete('/users/:id', protectAdmin, deleteUser);

export default router;
