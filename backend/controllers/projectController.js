const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects
// @route   GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    const { search, status, priority, page = 1, limit = 10 } = req.query;
    let query = {};

    // Members see only their projects; admins see all
    if (req.user.role !== 'admin') {
      query.$or = [
        { owner: req.user._id },
        { 'members.user': req.user._id },
      ];
    }

    if (search) query.title = { $regex: search, $options: 'i' };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Add task stats to each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const [totalTasks, completedTasks] = await Promise.all([
          Task.countDocuments({ project: project._id }),
          Task.countDocuments({ project: project._id, status: 'completed' }),
        ]);
        const projectObj = project.toObject();
        projectObj.totalTasks = totalTasks;
        projectObj.completedTasks = completedTasks;
        projectObj.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return projectObj;
      })
    );

    res.json({
      success: true,
      projects: projectsWithStats,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    // Check access
    if (req.user.role !== 'admin') {
      const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
      const isOwner = project.owner._id.toString() === req.user._id.toString();
      if (!isMember && !isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    const [totalTasks, completedTasks, pendingTasks, inProgressTasks] = await Promise.all([
      Task.countDocuments({ project: project._id }),
      Task.countDocuments({ project: project._id, status: 'completed' }),
      Task.countDocuments({ project: project._id, status: 'pending' }),
      Task.countDocuments({ project: project._id, status: 'in-progress' }),
    ]);

    const projectObj = project.toObject();
    projectObj.totalTasks = totalTasks;
    projectObj.completedTasks = completedTasks;
    projectObj.pendingTasks = pendingTasks;
    projectObj.inProgressTasks = inProgressTasks;
    projectObj.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({ success: true, project: projectObj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Create project
// @route   POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const { title, description, status, priority, startDate, endDate, members, tags, color } = req.body;

    const project = await Project.create({
      title, description, status, priority, startDate, endDate,
      owner: req.user._id, tags, color,
      members: members ? members.map(id => ({ user: id })) : [],
    });

    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    res.status(201).json({ success: true, message: 'Project created.', project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    // Only admin or owner
    if (req.user.role !== 'admin' && project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const allowedFields = ['title', 'description', 'status', 'priority', 'startDate', 'endDate', 'tags', 'color'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) project[field] = req.body[field];
    });

    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    res.json({ success: true, message: 'Project updated.', project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (req.user.role !== 'admin' && project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project and associated tasks deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
exports.addMember = async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (req.user.role !== 'admin' && project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const alreadyMember = project.members.some(m => m.user.toString() === userId);
    if (alreadyMember) return res.status(400).json({ success: false, message: 'Already a member.' });

    project.members.push({ user: userId, role });
    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.json({ success: true, message: 'Member added.', project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    if (req.user.role !== 'admin' && project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();

    res.json({ success: true, message: 'Member removed.', project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
