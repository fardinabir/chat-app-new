// index.js
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();
const { authenticate } = require('./src/middleware/authMiddleware');
const authRoutes = require('./src/routes/authRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const sequelize = require('./src/database/connection'); // Import Sequelize connection
const socketHandler = require('./socketHandler');
const { consume } = require('./src/kafka/consumer');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/api', authenticate, chatRoutes);

// Use the socketHandler
socketHandler(io);

// Initialize kafka consumer
consume(io)

// Synchronize Sequelize models with the database
sequelize.sync({ force: false }).then(() => {
  console.log('Sequelize models synchronized with the database');

  // Start the server
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
