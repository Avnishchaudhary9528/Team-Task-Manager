const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all users (admin only)
// @route   GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, message: 'Role updated.', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Toggle user active status (admin only)
// @route   PUT /api/users/:id/toggle-status
exports.toggleUserStatus = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate yourself.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get user stats
// @route   GET /api/users/:id/stats
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;
    const [totalTasks, completedTasks, pendingTasks, inProgressTasks, overdueTasks] = await Promise.all([
      Task.countDocuments({ assignedTo: userId }),
      Task.countDocuments({ assignedTo: userId, status: 'completed' }),
      Task.countDocuments({ assignedTo: userId, status: 'pending' }),
      Task.countDocuments({ assignedTo: userId, status: 'in-progress' }),
      Task.countDocuments({
        assignedTo: userId,
        status: { $ne: 'completed' },
        dueDate: { $lt: new Date() },
      }),
    ]);

    res.json({
      success: true,
      stats: { totalTasks, completedTasks, pendingTasks, inProgressTasks, overdueTasks },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
