
const {
  saveMessageToRedis, getRecentMessages, setUserActive, getUserActive, setUserOffline
} = require('./utils/redisUtils');
const {saveMessage} = require('./src/repos/chatRoom');
const { verifyToken } = require('./utils/jwtUtils');
const { produce } = require('./src/kafka/producer');
const { topic: {CHAT_MESSAGES, CHAT_EVENTS} } = require('./config');

// socketHandler.js
const socketHandler = (io) => {
    io.on('connection', (socket) => {
      console.log('A user connected : ', socket.id);
      const {userId, userMail, err} = verifyToken(socket.handshake.headers.authorization.replace('BEARER ', ''))
      if(err) {
        console.log("Token error : ", err)
        socket.emit('receiveMessage', 'Token Unauthorized');
        socket.disconnect(true)
      }
      console.log("Connected user : ", userMail)

      
      socket.on('joinRoom', (roomId) => {
        console.log("joined Room ---------", roomId);
        socket.join(roomId);

        // socket.broadcast
        // .to(roomId)
        // .emit(
        //   'receiveMessage',
        //   `${userMail} joined the room`,
        // );
        // socket.emit('receiveMessage', `Welcome to room no ${roomId}`);
        setUserActive({roomId, userMail, status:true})

        saveMessage(`${userMail} joined the room`, userMail, true, roomId);
        const newMessage = prepareMessage(roomId, `${userMail} joined the room`, userMail, true)
        produce(newMessage, CHAT_EVENTS)
      });
  
      socket.on('sendMessage', (data) => {
        const { roomId, message } = data;
        saveMessage(message, userMail, false, roomId);
        const newMessage = prepareMessage(roomId, message ,userMail,false)
        produce(newMessage, CHAT_MESSAGES)
        // io.to(roomId).emit('receiveMessage', newMessage);
      });
  
      // socket.on('receiveMessage', (message) => {
      //   // Handle received message, e.g., log it or perform custom actions
      //   console.log('---------Received message:', message);
        
      //   // Broadcast the received message to all clients in the same room
      //   // const { roomId } = message;
      //   // io.to(roomId).emit('receiveMessage', message);
      // });

      socket.on('getRecentMessages', async (data) => {
        const { roomId, count } = data;
        const messages = await getRecentMessages(roomId, count);
        socket.emit('recentMessages', messages);
      });
  
      socket.on('disconnect', () => {
        setUserOffline(socket.id)
        console.log('-----------User disconnected-----------');
      });
    });
  };
  

const prepareMessage = (roomId, messageText, userMail, isEvent) =>  ({roomId, messageText, userMail, isEvent})

module.exports = socketHandler;
  