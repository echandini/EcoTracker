const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

function sign(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function hasValidAdminInviteCode(code) {
  const configuredCode = process.env.ADMIN_INVITE_CODE;
  if (!configuredCode || typeof code !== 'string') return false;

  const configuredBuffer = Buffer.from(configuredCode);
  const suppliedBuffer = Buffer.from(code);
  return configuredBuffer.length === suppliedBuffer.length &&
    crypto.timingSafeEqual(configuredBuffer, suppliedBuffer);
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role = 'resident', adminInviteCode } = req.body || {};
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' ||
        !name.trim() || !email.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (!['resident', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be resident or admin' });
    }
    if (role === 'admin') {
      if (!process.env.ADMIN_INVITE_CODE) {
        return res.status(503).json({ success: false, message: 'Admin registration is not configured' });
      }
      if (!hasValidAdminInviteCode(adminInviteCode)) {
        return res.status(403).json({ success: false, message: 'Invalid admin registration code' });
      }
    }
    if (Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ success: false, message: 'Password must be no more than 72 bytes' });
    }
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: passwordHash, role });
    res.status(201).json({ success: true, message: 'Registration successful. Please log in.', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ success: false, message: 'Email already registered' });
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' ||
        !email.trim() || !password || !['resident', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Email, password and a valid role are required' });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || user.role !== role || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email, password or role' });
    }
    res.json({ success: true, token: sign(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (e) { next(e); }
});

module.exports = router;
