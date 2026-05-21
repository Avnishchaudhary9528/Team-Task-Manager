const express = require('express');
const router = express.Router();
const {
  getTasks, getProjectTasks, getTask, createTask, updateTask, deleteTask, addComment, deleteComment,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getTasks).post(createTask);
router.get('/project/:projectId', getProjectTasks);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

module.exports = router;
