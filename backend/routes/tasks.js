const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(taskController.getTasks).post(taskController.createTask);
router.get('/project/:projectId', taskController.getProjectTasks);
router.route('/:id').get(taskController.getTask).put(taskController.updateTask).delete(taskController.deleteTask);
router.post('/:id/comments', taskController.addComment);
router.delete('/:id/comments/:commentId', taskController.deleteComment);

module.exports = router;