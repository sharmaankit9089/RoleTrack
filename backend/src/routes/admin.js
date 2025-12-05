const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const User = require('../models/user');
const Task = require('../models/task');

const router = express.Router();

// All routes below require auth + admin role
router.use(auth);
router.use(authorize('admin'));

// GET /api/v1/admin/users - list users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { next(err); }
});

// GET /api/v1/admin/users/:id/tasks - get tasks for specific user
router.get('/users/:id/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.params.id });
    res.json(tasks);
  } catch (err) { next(err); }
});

// PATCH /api/v1/admin/users/:id/role - change user role
router.patch('/users/:id/role', [body('role').isIn(['user','admin'])], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

// POST /api/v1/admin/tasks - create/assign task to any user
router.post('/tasks', [body('title').isLength({ min: 1 }), body('owner').isMongoId()], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const task = new Task({ title: req.body.title, description: req.body.description, owner: req.body.owner });
    await task.save();
    res.status(201).json(task);
  } catch (err) { next(err); }
});

// PUT /api/v1/admin/tasks/:id - update any task
router.put('/tasks/:id', async (req, res, next) => {
  try {
    const updates = { title: req.body.title, description: req.body.description, completed: req.body.completed };
    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) { next(err); }
});

// DELETE /api/v1/admin/tasks/:id - delete any task
router.delete('/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
