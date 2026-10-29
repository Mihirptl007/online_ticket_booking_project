const db = require('../data/db');
const User = require('../models/User');

class UserController {
  getAllUsers(req, res) {
    try {
      const users = db.get('users');
      const safeUsers = users.map(u => new User(u).toSafeObject());
      return res.json({ success: true, count: safeUsers.length, users: safeUsers });
    } catch (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  toggleUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { status } = req.body; // 'active' | 'blocked'

      const user = db.get('users').find(u => u.userId === userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role === 'admin') {
        return res.status(400).json({ error: 'Cannot block administrator account' });
      }

      const newStatus = status || (user.status === 'active' ? 'blocked' : 'active');
      const updated = db.update('users', u => u.userId === userId, u => ({
        ...u,
        status: newStatus
      }));

      return res.json({
        success: true,
        message: `User status updated to ${newStatus}`,
        user: new User(updated).toSafeObject()
      });
    } catch (err) {
      console.error('Error toggling user status:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  updateHostUpiProfile(req, res) {
    try {
      const { hostId } = req.params;
      const { upiId, upiName, name, phone } = req.body;

      const user = db.get('users').find(u => u.userId === hostId);
      if (!user) {
        return res.status(404).json({ error: 'Host user not found' });
      }

      const updated = db.update('users', u => u.userId === hostId, u => ({
        ...u,
        name: name || u.name,
        phone: phone !== undefined ? phone : u.phone,
        upiId: upiId !== undefined ? upiId : u.upiId,
        upiName: upiName !== undefined ? upiName : u.upiName
      }));

      return res.json({
        success: true,
        message: 'Host profile & UPI configuration updated successfully',
        host: new User(updated).toSafeObject()
      });
    } catch (err) {
      console.error('Error updating host profile:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new UserController();
