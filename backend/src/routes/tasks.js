const express = require('express');
const {body, validationResult} = require('express-validator');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// GET /api/v1/tasks
// Admins can pass ?all=true to list all tasks
router.get('/', async (req, res, next) => {
  try {
    let tasks;
    if (req.user.role === 'admin' && req.query.all === 'true') tasks = await Task.find();
    else tasks = await Task.find({user: req.user._id});
    res.json(tasks);
  } catch (err) { next(err); }
});

router.post('/', [body('title').isLength({min:1})], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    // Admins may assign tasks to other users by providing `user` in the body
    let userId = req.user._id;
    if (req.user.role === 'admin' && req.body.user) userId = req.body.user;

    const task = new Task({title: req.body.title, description: req.body.description, user: userId});
    await task.save();
    res.status(201).json(task);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    let task;
    if (req.user.role === 'admin') task = await Task.findById(req.params.id);
    else task = await Task.findOne({_id: req.params.id, user: req.user._id});
    if (!task) return res.status(404).json({error: 'Not found'});
    res.json(task);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const updates = {title: req.body.title, description: req.body.description, completed: req.body.completed};
    let task;
    if (req.user.role === 'admin') {
      task = await Task.findByIdAndUpdate(req.params.id, updates, {new: true});
    } else {
      task = await Task.findOneAndUpdate({_id: req.params.id, user: req.user._id}, updates, {new: true});
    }
    if (!task) return res.status(404).json({error: 'Not found'});
    res.json(task);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    let task;
    if (req.user.role === 'admin') task = await Task.findByIdAndDelete(req.params.id);
    else task = await Task.findOneAndDelete({_id: req.params.id, user: req.user._id});
    if (!task) return res.status(404).json({error: 'Not found'});
    res.json({ok: true});
  } catch (err) { next(err); }
});

// Admin helper: get tasks for a specific user
router.get('/user/:id', async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({error: 'Forbidden'});
    const tasks = await Task.find({user: req.params.id});
    res.json(tasks);
  } catch (err) { next(err); }
});

module.exports = router;
