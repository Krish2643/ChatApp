import express from 'express';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/messages/:conversationId
// @desc    Get all messages for a conversation
// @access  Private
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is part of the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'You are not part of this conversation' });
    }
    
    // Get messages
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { 
        conversation: conversationId,
        sender: { $ne: req.user._id },
        status: { $ne: 'read' }
      },
      { status: 'read' }
    );
    
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { conversation, content } = req.body;
    
    // Check if conversation exists
    const conversationDoc = await Conversation.findById(conversation);
    if (!conversationDoc) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Check if user is part of the conversation
    if (!conversationDoc.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'You are not part of this conversation' });
    }
    
    // Create message
    const newMessage = await Message.create({
      conversation,
      sender: req.user._id,
      content
    });
    
    // Update last message in conversation
    await Conversation.findByIdAndUpdate(conversation, {
      lastMessage: newMessage._id
    });
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;