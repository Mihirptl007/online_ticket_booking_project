const db = require('../data/db');
const User = require('../models/User');

class AuthController {
  login(req, res) {
    try {
      const { email, password, role } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const users = db.get('users');
      const foundData = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!foundData) {
        return res.status(401).json({ error: 'Invalid credentials. User not found.' });
      }

      const user = new User(foundData);
      const authResult = user.login(password);

      if (!authResult.success) {
        return res.status(401).json({ error: authResult.message });
      }

      // Check role match if requested
      if (role && user.role !== role) {
        return res.status(403).json({
          error: `Account exists as '${user.role}' but you attempted to login as '${role}'. Please select the '${user.role}' login.`
        });
      }

      // Generate a mock auth token
      const token = `tok_${user.userId}_${Date.now()}`;

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: user.toSafeObject()
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  register(req, res) {
    try {
      const { name, email, password, phone, role = 'user', upiId, upiName } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      const users = db.get('users');
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ error: 'Email already registered. Please login.' });
      }

      const userId = `usr_${role}_${Date.now()}`;
      const newUser = new User({
        userId,
        name,
        email,
        phone: phone || '',
        password,
        role: ['user', 'host', 'admin'].includes(role) ? role : 'user',
        upiId: role === 'host' ? (upiId || `${email.split('@')[0]}@okaxis`) : '',
        upiName: role === 'host' ? (upiName || name) : ''
      });

      newUser.register();

      db.insert('users', {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        password: newUser.password,
        role: newUser.role,
        status: newUser.status,
        upiId: newUser.upiId,
        upiName: newUser.upiName,
        createdAt: newUser.createdAt
      });

      const token = `tok_${newUser.userId}_${Date.now()}`;

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: newUser.toSafeObject()
      });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  getMe(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.replace('Bearer ', '');
    const parts = token.split('_');
    const userId = parts.slice(1, -1).join('_') || parts[1];

    const users = db.get('users');
    const user = users.find(u => u.userId === userId || token.includes(u.userId));

    if (!user) {
      return res.status(404).json({ error: 'Session expired or invalid user' });
    }

    return res.json({
      success: true,
      user: new User(user).toSafeObject()
    });
  }
}

module.exports = new AuthController();
