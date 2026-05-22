// @desc    Create task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate, tags, status } = req.body;

    if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });
    if (!project) return res.status(400).json({ success: false, message: 'Project is required.' });

    // Check project access
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ success: false, message: 'Project not found.' });

    // Normalize status value
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