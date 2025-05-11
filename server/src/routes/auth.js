import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js'; 

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'chatappsecret',
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      user,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'chatappsecret',
      { expiresIn: '30d' }
    );
    
    res.json({
      user,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;