const { getRecentMessages, setUserActive, setUserOffline, getOnlineUsers } = require('./utils/redisUtils');
const {saveMessage} = require('./src/repos/chatRoom');
const { verifyToken } = require('./utils/jwtUtils');
const { produce } = require('./src/kafka/producer');
const { kafkaConfig } = require('./config');

// socketHandler.js
const socketHandler = (io) => {
    io.on('connection', (socket) => {
      console.log('A user connected : ', socket.id);
      const {userMail, err} = verifyToken(socket.handshake.headers.authorization.replace('BEARER ', ''))
      if(err) {
        console.log("Token error : ", err)
        socket.emit('receiveMessage', 'Token Unauthorized');
        socket.disconnect(true)
      }
      console.log("Connected user : ", userMail)

      // * JoinRoom - Logics
      socket.on('joinRoom', async (data) => {
        const { roomId } = data;
        console.log("joined Room ---------", roomId);
        socket.join(roomId);

        socket.emit('receiveMessage', `Welcome ${userMail} to room no ${roomId}`);
        await setUserActive(socket.id, roomId, userMail)

        const newMessage = prepareMessage(roomId, `${userMail} joined the room`, userMail, true)
        await produce(newMessage, kafkaConfig.topic.CHAT_EVENTS)
        // hit online users change
        const users = await getOnlineUsers(roomId);
        console.log('Online users', users);
        // socket.to(roomId).emit('onlineUsers', {
        //   roomId: roomId,
        //   users: users,
        // });
        io.to(roomId).emit('onlineUsers', {
          roomId: roomId,
          users: users,
        });
      });

      // * SendMessage Logics
      socket.on('sendMessage', (data) => {
        const { roomId, message } = data;
        // saveMessage(message, userMail, false, roomId);
        const newMessage = prepareMessage(roomId, message ,userMail,false)
        produce(newMessage, kafkaConfig.topic.CHAT_MESSAGES)
        // io.to(roomId).emit('receiveMessage', newMessage);
      });
  
      // socket.on('receiveMessage', (message) => {
      //   // Handle received message, e.g., log it or perform custom actions
      //   console.log('---------Received message:', message);

      //   // Broadcast the received message to all clients in the same room
      //   // const { roomId } = message;
      //   // io.to(roomId).emit('receiveMessage', message);
      // });

      // * GetRecentMessages Logics
      socket.on('getRecentMessages', async (data) => {
        const { roomId, count } = data;
        const messages = await getRecentMessages(roomId, count);
        socket.emit('recentMessages', messages);
      });

      // * GetOnlineUsers Logics
      socket.on('getOnlineUsers', async (data) => {
        const { roomId } = data;
        const users = await getOnlineUsers(roomId);
        console.log('Online users', users);
        socket.emit('onlineUsers', {
          roomId: roomId,
          users: users,
        });
      });

      socket.on('disconnect', async () => {
        try {
          const { userMail, roomId } = await setUserOffline(socket.id);
          console.log("this data was received -> ", userMail, roomId)
          // socket.to(roomId).emit('receiveMessage', `User ${userMail} left the chat`);
          console.log(`User ${userMail} with socket ID ${socket.id} disconnected from room ${roomId}`);

          // await saveMessage(`User ${userMail} left the room`, userMail, true, roomId);
          const newMessage = prepareMessage(roomId, `User ${userMail} left the room`, userMail, true)
          produce(newMessage, kafkaConfig.topic.CHAT_MESSAGES)
          // io.to(roomId).emit('receiveMessage', newMessage);
          // hit online users change
          const users = await getOnlineUsers(roomId);
          console.log('Online users', users);
          io.to(roomId).emit('onlineUsers', {
            roomId: roomId,
            users: users,
          });
        } catch (error) {
          console.error('Error handling disconnected user:', error);
        }
      });
    });
  };
  

const prepareMessage = (roomId, messageText, userMail, isEvent) =>  ({roomId, messageText, userMail, isEvent})

module.exports = socketHandler;
  