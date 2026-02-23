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
  const allTasks = await Task.find({ owner: req.user._id }).sort({ createdAt: 1 });

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((task) => task.status === 'Completed').length;
  const pendingTasks = allTasks.filter((task) => task.status === 'Pending').length;

  const priorityData = {
    Low: allTasks.filter((task) => task.priority === 'Low').length,
    Medium: allTasks.filter((task) => task.priority === 'Medium').length,
    High: allTasks.filter((task) => task.priority === 'High').length
  };

  const overdueTasks = allTasks.filter((task) => task.deadline && task.status === 'Pending' && new Date(task.deadline) < new Date()).length;

  const recentTaskTrendMap = {};
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    recentTaskTrendMap[key] = 0;
  }

  allTasks.forEach((task) => {
    const key = new Date(task.createdAt).toISOString().slice(0, 10);
    if (Object.prototype.hasOwnProperty.call(recentTaskTrendMap, key)) {
      recentTaskTrendMap[key] += 1;
    }
  });

  const analytics = {
    priorityLabels: Object.keys(priorityData),
    priorityValues: Object.values(priorityData),
    trendLabels: Object.keys(recentTaskTrendMap),
    trendValues: Object.values(recentTaskTrendMap),
    completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
    overdueTasks
  };

  res.render('tasks/index', {
    tasks,
    filters: { status: status || 'All', priority: priority || 'All' },
    stats: { totalTasks, completedTasks, pendingTasks },
    analytics
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
