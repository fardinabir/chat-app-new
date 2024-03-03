// index.js
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');
const { authenticate } = require('./src/middleware/authMiddleware');
const authRoutes = require('./src/routes/authRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const socketHandler = require('./socketHandler');
const { consume } = require('./src/kafka/consumer');
const { startServer, handleShutdown } = require('./serverHandler');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/api', authenticate, chatRoutes);
app.use(express.static('public'));

// Use the socketHandler
socketHandler(io);

// Initialize kafka consumer
consume(io).then(r => {
    console.log("Working consumer")
}).catch(err => {
    console.log("Occurred error ", err)
});

// Synchronize Sequelize models with the database
(async () => {
    const srv = await startServer(PORT, server);
    await handleShutdown(srv);
})();
