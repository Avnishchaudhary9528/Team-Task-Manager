const express = require('express');
const router = express.Router();
const { getDashboardStats, getActivity } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getDashboardStats);
router.get('/activity', getActivity);

module.exports = router;
