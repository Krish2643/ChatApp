import express from 'express';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/conversations
// @desc    Get all conversations for a user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user._id] }
    })
    .populate('participants', 'name email avatar')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
    
    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/conversations
// @desc    Create a new conversation
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { recipient } = req.body;
    
    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipient] }
    });
    
    if (existingConversation) {
      return res.json(existingConversation);
    }
    
    // Create new conversation
    const newConversation = await Conversation.create({
      participants: [req.user._id, recipient]
    });
    
    // Populate participants
    await newConversation.populate('participants', 'name email avatar');
    
    res.status(201).json(newConversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;