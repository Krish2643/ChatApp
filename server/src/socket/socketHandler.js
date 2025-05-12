import { Message } from '../models/Message.js';

// Store online users
const onlineUsers = new Map();

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('New connection:', socket.id);
    
    // Get user ID from query params
    const userId = socket.handshake.query.userId;
    
    if (userId) {
      // Add user to online users
      onlineUsers.set(userId, socket.id);
      
      // Send online status to other users
      socket.broadcast.emit('user_status', {
        userId,
        status: 'online'
      });
      
      // Send list of online users to the newly connected user
      socket.emit('online_users', Array.from(onlineUsers.keys()));
      
      console.log('User connected:', userId);
      console.log('Online users:', onlineUsers.size);
    }
    
    // Handle typing indicator
    socket.on('typing', async (data) => {
      const { conversationId, receiverId } = data;
      
      if (receiverId && onlineUsers.has(receiverId)) {
        const receiverSocketId = onlineUsers.get(receiverId);
        io.to(receiverSocketId).emit('typing', {
          conversationId,
          senderId: userId
        });
      }
    });
    
    // Handle stop typing
    socket.on('stop_typing', async (data) => {
      const { conversationId, receiverId } = data;
      
      if (receiverId && onlineUsers.has(receiverId)) {
        const receiverSocketId = onlineUsers.get(receiverId);
        io.to(receiverSocketId).emit('stop_typing', {
          conversationId,
          senderId: userId
        });
      }
    });
    
    // Handle new message
    socket.on('new_message', async (data) => {
      const { message, receiverId } = data;
      
      try {
        // Update message status to delivered
        const updatedMessage = await Message.findByIdAndUpdate(
          message._id,
          { status: 'delivered' },
          { new: true }
        ).populate('sender', 'name email');
        
        // Emit to sender (for confirmation)
        socket.emit('new_message', { message: updatedMessage });
        
        // Send to receiver if online
        if (receiverId && onlineUsers.has(receiverId)) {
          const receiverSocketId = onlineUsers.get(receiverId);
          io.to(receiverSocketId).emit('new_message', { message: updatedMessage });
        }
        
        // Broadcast to all users in the conversation
        io.emit('conversation_updated', {
          conversationId: message.conversation,
          lastMessage: updatedMessage
        });
      } catch (error) {
        console.error('Error handling new message:', error);
      }
    });
    
    // Handle message read
    socket.on('message_read', async (data) => {
      const { messageId, conversationId } = data;
      
      try {
        // Update message status to read
        await Message.findByIdAndUpdate(messageId, { status: 'read' });
        
        // Notify sender that message was read
        const message = await Message.findById(messageId);
        if (message && onlineUsers.has(message.sender.toString())) {
          const senderSocketId = onlineUsers.get(message.sender.toString());
          io.to(senderSocketId).emit('message_read', { messageId, conversationId });
        }
      } catch (error) {
        console.error('Error updating message read status:', error);
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      if (userId) {
        // Remove from online users
        onlineUsers.delete(userId);
        
        // Notify other users
        socket.broadcast.emit('user_status', {
          userId,
          status: 'offline'
        });
        
        console.log('User disconnected:', userId);
        console.log('Online users:', onlineUsers.size);
      }
    });
  });
};