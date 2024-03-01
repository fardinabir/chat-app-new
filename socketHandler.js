
const { saveMessageToRedis, getRecentMessages } = require('./utils/redisUtils');
const {saveMessage} = require('./src/repos/chatRoom');
const { verifyToken } = require('./utils/jwtUtils');

// socketHandler.js
const socketHandler = (io) => {
    io.on('connection', (socket) => {
      console.log('A user connected : ', socket);
      const decodedToken = verifyToken(socket.handshake.headers.authorization.replace('BEARER ', ''))
      console.log("Connected user : ", decodedToken)
      socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
      });
  
      socket.on('sendMessage', (data) => {
        const { roomId, message } = data;
        saveMessage(data);
        io.to(roomId).emit('receiveMessage', message);
      });
  
      socket.on('getRecentMessages', async (data) => {
        const { roomId, count } = data;
        const messages = await getRecentMessages(roomId, count);
        socket.emit('recentMessages', messages);
      });
  
      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  };
  
  module.exports = socketHandler;
  