const { getRecentMessages, setUserActive, setUserOffline, getOnlineUsers } = require('../../utils/redisUtils');
const {saveMessage} = require('../repos/chatRoom');
const { verifyToken } = require('../../utils/jwtUtils');
const { produce } = require('../kafka/producer');
const { kafkaConfig } = require('../../config');

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
        const { roomName } = data;
        console.log("joined Room ---------", roomName);
        socket.join(roomName);

        socket.emit('receiveMessage', `Welcome ${userMail} to room no ${roomName}`);
        await setUserActive(socket.id, roomName, userMail)

        const newMessage = prepareMessage(roomName, `${userMail} joined the room`, userMail, true)
        await produce(newMessage, kafkaConfig.topic.CHAT_EVENTS)
        // hit online users change
        const users = await getOnlineUsers(roomName);
        console.log('Online users', users);
        // socket.to(roomName).emit('onlineUsers', {
        //   roomName: roomName,
        //   users: users,
        // });
        io.to(roomName).emit('onlineUsers', {
          roomName: roomName,
          users: users,
        });
      });

      // * SendMessage Logics
      socket.on('sendMessage', (data) => {
        const { roomName, message } = data;
        // saveMessage(message, userMail, false, roomName);
        const newMessage = prepareMessage(roomName, message ,userMail,false)
        produce(newMessage, kafkaConfig.topic.CHAT_MESSAGES)
        // io.to(roomName).emit('receiveMessage', newMessage);
      });
  
      // socket.on('receiveMessage', (message) => {
      //   // Handle received message, e.g., log it or perform custom actions
      //   console.log('---------Received message:', message);

      //   // Broadcast the received message to all clients in the same room
      //   // const { roomName } = message;
      //   // io.to(roomName).emit('receiveMessage', message);
      // });

      // * GetRecentMessages Logics
      socket.on('getRecentMessages', async (data) => {
        const { roomName, count } = data;
        const messages = await getRecentMessages(roomName, count);
        socket.emit('recentMessages', messages);
      });

      // * GetOnlineUsers Logics
      socket.on('getOnlineUsers', async (data) => {
        const { roomName } = data;
        const users = await getOnlineUsers(roomName);
        console.log('Online users', users);
        socket.emit('onlineUsers', {
          roomName: roomName,
          users: users,
        });
      });

      socket.on('disconnect', async () => {
        try {
          const { userMail, roomName } = await setUserOffline(socket.id);
          console.log("this data was received -> ", userMail, roomName)
          // socket.to(roomName).emit('receiveMessage', `User ${userMail} left the chat`);
          console.log(`User ${userMail} with socket ID ${socket.id} disconnected from room ${roomName}`);

          // await saveMessage(`User ${userMail} left the room`, userMail, true, roomName);
          const newMessage = prepareMessage(roomName, `${userMail} left the room`, userMail, true)
          produce(newMessage, kafkaConfig.topic.CHAT_MESSAGES)
          // io.to(roomName).emit('receiveMessage', newMessage);
          // hit online users change
          const users = await getOnlineUsers(roomName);
          console.log('Online users', users);
          io.to(roomName).emit('onlineUsers', {
            roomName: roomName,
            users: users,
          });
        } catch (error) {
          console.error('Error handling disconnected user:', error);
        }
      });
    });
  };
  

const prepareMessage = (roomName, messageText, userMail, isEvent) =>  ({roomName, messageText, userMail, isEvent})

module.exports = socketHandler;
  