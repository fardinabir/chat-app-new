
const { saveMessageToRedis, getRecentMessages } = require('./utils/redisUtils');
const {saveMessage} = require('./src/repos/chatRoom');
const { verifyToken } = require('./utils/jwtUtils');

// socketHandler.js
const socketHandler = (io) => {
    io.on('connection', (socket) => {
      console.log('A user connected : ', socket.id);
      const {userId, userMail, err} = verifyToken(socket.handshake.headers.authorization.replace('BEARER ', ''))
      if(err) {
        console.log("Token error : ", err)
        socket.disconnect(true)
      }
      console.log("Connected user : ", userMail)

      
      socket.on('joinRoom', (roomId) => {
        console.log("joined Room ---------", roomId);
        socket.join(roomId);

        socket.broadcast
        .to(roomId)
        .emit(
          'receiveMessage',
          `${userMail} joined the room`,
        );
        socket.emit('receiveMessage', `Welcome to room no ${roomId}`);
        setUserActive({roomId, userMail, status:true})
      });
  
      socket.on('sendMessage', (data) => {
        const { roomId, message } = data;
        saveMessage(data);
        io.to(roomId).emit('receiveMessage', message);
      });
  
      socket.on('receiveMessage', (message) => {
        // Handle received message, e.g., log it or perform custom actions
        console.log('---------Received message:', message);
        
        // Broadcast the received message to all clients in the same room
        // const { roomId } = message;
        // io.to(roomId).emit('receiveMessage', message);
      });

      socket.on('getRecentMessages', async (data) => {
        const { roomId, count } = data;
        const messages = await getRecentMessages(roomId, count);
        socket.emit('recentMessages', messages);
      });
  
      socket.on('disconnect', () => {
        setUserActive({roomId, userMail, status:false})
        console.log('User disconnected');
      });
    });
  };
  


  module.exports = socketHandler;
  