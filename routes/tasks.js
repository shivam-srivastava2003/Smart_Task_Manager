const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const tasks = require('../controllers/tasks');
const { isLoggedIn, validateTask, isTaskOwner } = require('../middleware');

router.use(isLoggedIn);

router.get('/', catchAsync(tasks.index));
router.get('/new', tasks.renderNewForm);
router.post('/', validateTask, catchAsync(tasks.createTask));

router.get('/:id/edit', catchAsync(isTaskOwner), catchAsync(tasks.renderEditForm));
router.put('/:id', catchAsync(isTaskOwner), validateTask, catchAsync(tasks.updateTask));
router.patch('/:id/toggle', catchAsync(isTaskOwner), catchAsync(tasks.toggleStatus));
router.delete('/:id', catchAsync(isTaskOwner), catchAsync(tasks.deleteTask));

module.exports = router;
