const express = require('express');
const {body, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route POST /api/v1/auth/register
 */
router.post('/register', [
  body('name').isLength({min:1}),
  body('email').isEmail(),
  body('password').isLength({min:6})
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    const {name, email: rawEmail, password} = req.body;
    const email = (rawEmail || '').toString().trim().toLowerCase();
    let user = await User.findOne({email});
    if (user) return res.status(400).json({error: 'User already exists'});
    // Always create as normal user. Admins should be created via the seed script or DB.
    user = new User({name, email, password, role: 'user'});
    await user.save();

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET || 'secret', {expiresIn: '7d'});
    const userSafe = await User.findById(user._id).select('-password');
    res.status(201).json({token, user: userSafe});
  } catch (err) {
    next(err);
  }
});

router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    const {email: rawEmail, password} = req.body;
    const email = (rawEmail || '').toString().trim().toLowerCase();
    const user = await User.findOne({email}).select('+password');
    if (!user) return res.status(400).json({error: 'Invalid credentials'});

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({error: 'Invalid credentials'});

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET || 'secret', {expiresIn: '7d'});
    const userSafe = await User.findById(user._id).select('-password');
    res.json({token, user: userSafe});
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/auth/me
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({error: 'No token provided'});
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({error: 'Invalid token'});
    res.json(user);
  } catch (err) { next(err); }
});

// Admin-only: list users and change role
const authorize = require('../middleware/authorize');
router.get('/users', auth, authorize('admin'), async (req, res, next) => {
  try { const users = await User.find().select('-password'); res.json(users); } catch (err) { next(err); }
});

router.patch('/users/:id/role', auth, authorize('admin'), [body('role').isIn(['user','admin'])], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
    const user = await User.findByIdAndUpdate(req.params.id, {role: req.body.role}, {new: true}).select('-password');
    if (!user) return res.status(404).json({error: 'User not found'});
    res.json(user);
  } catch (err) { next(err); }
});

module.exports = router;
