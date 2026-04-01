const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shuttle_tracking')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

// Make io accessible to routes
app.set('io', io);

// Routes
const authRoutes = require('./routes/auth');
const shuttleRoutes = require('./routes/shuttle');
const routeRoutes = require('./routes/route');

app.use('/api/auth', authRoutes);
app.use('/api/shuttles', shuttleRoutes);
app.use('/api/routes', routeRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: '🚐 Shuttle Tracking API is running!' });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Driver updates location
  socket.on('update-location', async (data) => {
    const { shuttle_id, lat, lng } = data;
    console.log(`📍 Location update from shuttle ${shuttle_id}:`, lat, lng);
    
    // Update database
    const Shuttle = require('./models/Shuttle');
    await Shuttle.findByIdAndUpdate(shuttle_id, {
      current_location: { lat, lng }
    });
    
    // Broadcast to all connected users
    io.emit('location-updated', { shuttle_id, lat, lng });
  });

  // User joins to track specific shuttle
  socket.on('track-shuttle', (shuttle_id) => {
    socket.join(`shuttle-${shuttle_id}`);
    console.log(`👀 User tracking shuttle: ${shuttle_id}`);
  });

  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready for real-time updates`);
});
const paymentRoutes = require('./routes/payment');
app.use('/api/payments', paymentRoutes);