const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    let projectQuery = {};
    let taskQuery = {};

    if (!isAdmin) {
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      projectQuery._id = { $in: projectIds };
      taskQuery.project = { $in: projectIds };
    }

    const now = new Date();

    const [
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      totalUsers,
    ] = await Promise.all([
      Project.countDocuments(projectQuery),
      Project.countDocuments({ ...projectQuery, status: 'active' }),
      Task.countDocuments(taskQuery),
      Task.countDocuments({ ...taskQuery, status: 'completed' }),
      Task.countDocuments({ ...taskQuery, status: 'pending' }),
      Task.countDocuments({ ...taskQuery, status: 'in-progress' }),
      Task.countDocuments({ ...taskQuery, status: { $ne: 'completed' }, dueDate: { $lt: now } }),
      isAdmin ? User.countDocuments() : 0,
    ]);

    // Recent tasks (last 5)
    const recentTasks = await Task.find(taskQuery)
      .populate('assignedTo', 'name avatar')
      .populate('project', 'title color')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent projects (last 5)
    const recentProjects = await Project.find(projectQuery)
      .populate('owner', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // Tasks due soon (next 7 days)
    const tasksDueSoon = await Task.find({
      ...taskQuery,
      status: { $ne: 'completed' },
      dueDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    })
      .populate('assignedTo', 'name avatar')
      .populate('project', 'title color')
      .sort({ dueDate: 1 })
      .limit(5);

    // Monthly task completion (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Task.aggregate([
      {
        $match: {
          ...taskQuery,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Priority breakdown
    const priorityData = await Task.aggregate([
      { $match: taskQuery },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        totalUsers,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      recentTasks,
      recentProjects,
      tasksDueSoon,
      charts: { monthlyData, priorityData },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get activity feed
// @route   GET /api/dashboard/activity
exports.getActivity = async (req, res) => {
  try {
    const taskQuery = req.user.role !== 'admin' ? {
      $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }],
    } : {};

    const tasks = await Task.find(taskQuery)
      .populate('activity.user', 'name avatar')
      .populate('project', 'title')
      .sort({ updatedAt: -1 })
      .limit(20);

    const activities = [];
    tasks.forEach(task => {
      task.activity.slice(-2).forEach(act => {
        activities.push({
          taskId: task._id,
          taskTitle: task.title,
          projectTitle: task.project?.title,
          user: act.user,
          action: act.action,
          field: act.field,
          oldValue: act.oldValue,
          newValue: act.newValue,
          createdAt: act.createdAt,
        });
      });
    });

    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, activities: activities.slice(0, 20) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
