import express from 'express';
import {
  getUsers,
  loginUser,
  registerUser,
} from '../controllers/usersController.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/login', loginUser);
router.post('/register', registerUser);

export default router;
