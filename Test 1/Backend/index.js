require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

app.use(cors());
// MongoDB connection
try {
     mongoose.connect(process.env.MongoDB_URI, {});
    console.log("CONNECTED TO DATABASE SUCCESSFULLY");
} catch (error) {
    console.error('COULD NOT CONNECT TO DATABASE:', error.message);
}

// Message Schema
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); 
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
// Track connected users
const connectedUsers = new Set();
// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected' );

  // Handle user joining
  socket.on('join', (username) => {
    socket.username = username;
    connectedUsers.add(username);
    io.emit('chat message', {
      username: 'System',
      message: `Welcome ${username} to the chat!`
    });
    io.emit('user list', Array.from(connectedUsers)); // Broadcast updated user list
  });

  // Handle chat messages
  socket.on('chat message', async (msg) => {
    const message = new Message({
      username: socket.username,
      message: msg
    });
    await message.save();
    
    io.emit('chat message', {
      username: socket.username,
      message: msg
    });
// Gemini chatbot logic
const lowerMsg = msg.toLowerCase();
if (lowerMsg.includes('help') || lowerMsg.includes('support')) {
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: msg }] }],
    });
    const botResponse = result.response.text();
    io.emit('chat message', {
      username: 'ChatBot',
      message: botResponse
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    io.emit('chat message', {
      username: 'ChatBot',
      message: 'Sorry, I’m having trouble responding right now!'
    });
  }
}
    // Simple chatbot logic
    // if (msg.toLowerCase().includes('help')) {
    //   io.emit('chat message', {
    //     username: 'ChatBot',
    //     message: 'How can I assist you today?'
    //   });
    // }
  });
  

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.username) {
        connectedUsers.delete(socket.username);
      io.emit('chat message', {
        username: 'System',
        message: `${socket.username} has disconnected`
      });
      io.emit('user list', Array.from(connectedUsers)); // Broadcast updated user list
    }
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});