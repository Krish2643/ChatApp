import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import conversationRoutes from './src/routes/conversations.js';
import messageRoutes from './src/routes/messages.js';
import { socketHandler } from './src/socket/socketHandler.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Socket.io handler
socketHandler(io);

// Default route
app.get('/', (req, res) => {
  res.send('Chat API is running');
});

// Start server
const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});