const Task = require('../models/task');

module.exports.index = async (req, res) => {
  const { status, priority } = req.query;
  const query = { owner: req.user._id };

  if (status && ['Pending', 'Completed'].includes(status)) {
    query.status = status;
  }

  if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
    query.priority = priority;
  }

  const tasks = await Task.find(query).sort({ deadline: 1, createdAt: -1 });
  const totalTasks = await Task.countDocuments({ owner: req.user._id });
  const completedTasks = await Task.countDocuments({ owner: req.user._id, status: 'Completed' });
  const pendingTasks = await Task.countDocuments({ owner: req.user._id, status: 'Pending' });

  res.render('tasks/index', {
    tasks,
    filters: { status: status || 'All', priority: priority || 'All' },
    stats: { totalTasks, completedTasks, pendingTasks }
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render('tasks/new');
};

module.exports.createTask = async (req, res) => {
  const task = new Task(req.body.task);
  task.owner = req.user._id;
  await task.save();
  req.flash('success', 'Task created successfully.');
  res.redirect('/dashboard');
};

module.exports.renderEditForm = async (req, res) => {
  const { task } = res.locals;
  res.render('tasks/edit', { task });
};

module.exports.updateTask = async (req, res) => {
  const { id } = req.params;
  await Task.findOneAndUpdate({ _id: id, owner: req.user._id }, req.body.task, { runValidators: true });
  req.flash('success', 'Task updated successfully.');
  res.redirect('/dashboard');
};

module.exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  await Task.findOneAndDelete({ _id: id, owner: req.user._id });
  req.flash('success', 'Task deleted successfully.');
  res.redirect('/dashboard');
};

module.exports.toggleStatus = async (req, res) => {
  const { id } = req.params;
  const task = await Task.findOne({ _id: id, owner: req.user._id });
  task.status = task.status === 'Pending' ? 'Completed' : 'Pending';
  await task.save();
  req.flash('success', `Task marked as ${task.status}.`);
  res.redirect('/dashboard');
};
