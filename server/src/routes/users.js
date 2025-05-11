import express from 'express';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const users = await User.find({
      $and: [
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        },
        { _id: { $ne: req.user._id } }
      ]
    }).select('-password').limit(10);
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;