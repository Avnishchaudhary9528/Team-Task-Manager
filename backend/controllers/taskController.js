const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks
// @route   GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const { project, assignedTo, status, priority, search, overdue, page = 1, limit = 20 } = req.query;
    let query = {};

    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      query.project = { $in: projectIds };
    }

    if (project) query.project = project;
    if (assignedTo) query.assignedTo = assignedTo;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'completed' };
    }

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'title color')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      tasks,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get tasks for a project
// @route   GET /api/tasks/project/:projectId
exports.getProjectTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo, search } = req.query;
    let query = { project: req.params.projectId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) query.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name avatar')
      .sort({ order: 1, createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'title color')
      .populate('comments.user', 'name avatar')
      .populate('activity.user', 'name avatar');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Create task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate, tags, status } = req.body;

    if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });
    if (!project) return res.status(400).json({ success: false, message: 'Project is required.' });

    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ success: false, message: 'Project not found.' });

    const normalizedStatus = status ? status.toLowerCase().replace(' ', '-') : 'pending';
    const validStatuses = ['pending', 'in-progress', 'completed'];
    const finalStatus = validStatuses.includes(normalizedStatus) ? normalizedStatus : 'pending';

    const task = await Task.create({
      title, description, project,
      assignedTo: assignedTo || undefined,
      priority: priority || 'medium',
      status: finalStatus,
      dueDate: dueDate || undefined,
      tags,
      createdBy: req.user._id,
      activity: [{ user: req.user._id, action: 'created task' }],
    });

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('project', 'title color');

    res.status(201).json({ success: true, message: 'Task created.', task });
  } catch (error) {
    console.error('createTask error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error.' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    if (req.user.role !== 'admin') {
      const isAssigned = task.assignedTo?.toString() === req.user._id.toString();
      const isCreator = task.createdBy.toString() === req.user._id.toString();
      if (!isAssigned && !isCreator) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    const activityEntries = [];
    const updateableFields = ['title', 'description', 'assignedTo', 'priority', 'dueDate', 'tags', 'status', 'order'];

    updateableFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== task[field]?.toString()) {
        if (field === 'status' || field === 'priority') {
          activityEntries.push({
            user: req.user._id,
            action: 'updated',
            field,
            oldValue: task[field],
            newValue: req.body[field],
          });
        }
        task[field] = req.body[field];
      }
    });

    if (activityEntries.length > 0) {
      task.activity.push(...activityEntries);
    }

    await task.save();
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('project', 'title color');

    res.json({ success: true, message: 'Task updated.', task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Comment text required.' });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    task.comments.push({ user: req.user._id, text });
    task.activity.push({ user: req.user._id, action: 'added comment' });
    await task.save();
    await task.populate('comments.user', 'name avatar');

    res.json({ success: true, message: 'Comment added.', comments: task.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete comment
// @route   DELETE /api/tasks/:id/comments/:commentId
exports.deleteComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const comment = task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    if (req.user.role !== 'admin' && comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    comment.deleteOne();
    await task.save();

    res.json({ success: true, message: 'Comment deleted.', comments: task.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};