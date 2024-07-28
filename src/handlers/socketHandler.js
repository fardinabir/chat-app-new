const { getRecentMessages, setUserActive, setUserOffline, getOnlineUsers } = require('../../utils/redisUtils');
const {saveMessage} = require('../repos/chatRoom');
const { verifyToken } = require('../../utils/jwtUtils');
const { produce } = require('../kafka/producer');
const { kafkaConfig } = require('../../config');

// socketHandler.js
const socketHandler = (io) => {
    io.on('connection', (socket) => {
      console.log('A user requested connection : ', socket.id);
      
      let userMail
      try {
        const decoded = verifyToken(socket.handshake.headers.authorization.replace('BEARER ', ''));
        userMail = decoded.userMail;
      } catch (error) {
        console.error("Failed to verify token : ", error);
        socket.emit('receiveMessage', 'Token Unauthorized');
        socket.disconnect(true);
      };
      console.log("Connected user : ", userMail)

      // * JoinRoom Event
      socket.on('joinRoom', joinRoomHandler(socket,io, userMail));

      // * SendMessage Event
      socket.on('sendMessage', sendMessageHandler(userMail)); 

      // * GetRecentMessages Event
      socket.on('getRecentMessages', getRecentMessageHandler(socket));

      // * GetOnlineUsers Event
      socket.on('getOnlineUsers', getOnlineUsersHandler(socket));

      // * Disconnect Event
      socket.on('disconnect', disconnectHandler(socket, io));
    });
  };
  
  const joinRoomHandler = (socket, io, userMail) => {
    return async (data) => {
      const { roomName } = data;
      console.log("joined Room ---------", roomName);
      socket.join(roomName);
  
      socket.emit('receiveMessage', `Welcome ${userMail} to room no ${roomName}`);
      await setUserActive(socket.id, roomName, userMail)
  
      const newMessage = prepareMessage(roomName, `${userMail} joined the room`, userMail, true)
      await produce(newMessage, kafkaConfig.topic.CHAT_EVENTS)
      // hit online users change
      const users = await getOnlineUsers(roomName);
      console.log('Online users after joining : ', users);
  
      // Broadcasts to all clients in the specified room except the sender
      // socket.to(roomName).emit('onlineUsers', {
      //     roomName: roomName,
      //     users: users,
      //   });

      // Broadcasts to all clients in the specified room including the sender
      io.to(roomName).emit('onlineUsers', {
        roomName: roomName,
        users: users,
      });
    }
  }

  const sendMessageHandler = (userMail) => {
    return async (data) => {
      const { roomName, message } = data;
      // saveMessage(message, userMail, false, roomName);
      const newMessage = prepareMessage(roomName, message ,userMail,false)
      produce(newMessage, kafkaConfig.topic.CHAT_MESSAGES)
      // io.to(roomName).emit('receiveMessage', newMessage);
    }
  }

  const getRecentMessageHandler = (socket) => {
    return async (data) => {
    const { roomName, count } = data;
    const messages = await getRecentMessages(roomName, count);
    socket.emit('recentMessages', messages);
    }
  }

  const getOnlineUsersHandler = (socket) => {
    return async (data) => {
    const { roomName } = data;
    const users = await getOnlineUsers(roomName);
    console.log('Online users fetch : ', users);

    // emitting to update the list of online users in each room
    socket.emit('onlineUsers', {
      roomName: roomName,
      users: users,
    });
  }
}

  const disconnectHandler = (socket, io) => {
    return async () => {
      try {
        const { userMail, roomName } = await setUserOffline(socket.id);
        console.log(`User ${userMail} with socket ID ${socket.id} disconnected from room ${roomName}`);

        // await saveMessage(`User ${userMail} left the room`, userMail, true, roomName);
        const newMessage = prepareMessage(roomName, `${userMail} left the room`, userMail, true)
        produce(newMessage, kafkaConfig.topic.CHAT_MESSAGES)

        // change online users list
        const users = await getOnlineUsers(roomName);
        console.log('Online users after disconnection : ', users);
        io.to(roomName).emit('onlineUsers', {
          roomName: roomName,
          users: users,
        });
      } catch (error) {
        console.error('Error handling disconnected user:', error);
      }
  }
}


const prepareMessage = (roomName, messageText, userMail, isEvent) =>  ({roomName, messageText, userMail, isEvent})

module.exports = socketHandler;
  