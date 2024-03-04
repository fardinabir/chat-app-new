// index.js
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');
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
app.use('/api', chatRoutes);
app.use(express.static('public'));

// Use the socketHandler
socketHandler(io);

// Initialize kafka consumer
consume(io).then(r => {
    console.log("------------Working consumer, waiting for server to start-----------")
}).catch(err => {
    console.log("Occurred error ", err)
});

// Synchronize Sequelize models with the database
(async () => {
    const srv = await startServer(PORT, server);
    await handleShutdown(srv);
})();
