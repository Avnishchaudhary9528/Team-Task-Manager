const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUserRole, toggleUserStatus, deleteUser, getUserStats } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', getUsers);  // ← adminOnly hata diya, sab authenticated users dekh sakein
router.get('/:id', getUser);
router.get('/:id/stats', getUserStats);
router.put('/:id/role', adminOnly, updateUserRole);
router.put('/:id/toggle-status', adminOnly, toggleUserStatus);
router.delete('/:id', adminOnly, deleteUser);

module.exports = router;