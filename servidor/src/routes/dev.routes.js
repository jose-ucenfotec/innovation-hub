import { Router } from 'express';
import { User } from '../models/User.js';

const router = Router();
router.get('/users', async (_req, res) => {
  const usuarios = await User.find({ status: 'active' }).sort({ firstName: 1 }).lean();
  res.json(usuarios.map((u) => ({ id: String(u._id), fullName: [u.firstName, u.lastName, u.secondLastName].filter(Boolean).join(' ') })));
});
export default router;