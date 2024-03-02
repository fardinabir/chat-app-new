
const { getRecentMessages, setUserOnlineStatus, AddOnlineUsers, DeleteOnlineUsers } = require('./utils/redisUtils');
const { saveMessage } = require('./src/repos/chatRoom');
const { verifyToken } = require('./utils/jwtUtils');

// socketHandler.js
const socketHandler = (io) => {
    io.on('connection', (socket) => {
      console.log('A user connected : ', socket.id);
      const {userMail, err} = verifyToken(socket.handshake.headers.authorization.replace('BEARER ', ''))
      if(err) {
        console.log("Token error : ", err)
        socket.disconnect(true)
      }
      console.log("Connected user : ", userMail)

      // * JoinRoom - Logics
      socket.on('joinRoom', async (roomId) => {
        console.log("joined Room ---------", roomId);
        socket.join(roomId);

        // ? Get the 10 latest messages of the room that user is joining
        // let count = 10
        // const messages = await getRecentMessages(roomId, count);
        // //TODO: Discuss about this, will all the members see messages again?
        // socket.emit('receiveMessage', messages);
        socket.broadcast
        .to(roomId)
        .emit(
          'receiveMessage',
          `${userMail} joined the room`,
        );
        socket.emit('receiveMessage', `Welcome to room no ${roomId}`);

        await AddOnlineUsers(roomId, userMail).then( () => {
          console.log("Added user to the room with online status")
        })
      });

      // * SendMessage Logics
      socket.on('sendMessage', (data) => {
        const { roomId, message } = data;
        (async () => {
          try {
            const messageId = await saveMessage(data);
            console.log("Message saved successfully with ID:", messageId);
          } catch (error) {
            console.error("Error saving message:", error);
          }
        })();
        io.to(roomId).emit('receiveMessage', message);
      });

      // * ReceiveMessage Logics
      socket.on('receiveMessage', (message) => {
        // Handle received message, e.g., log it or perform custom actions
        console.log('---------Received message: ', message);
        // send the received message to all clients in the same room TODO: should we use broadcast here instead of only emit.
        socket
            .to(roomId)
            .emit(
                'receiveMessage',
                message,
            );
      });

      // * GetRecentMessages Logics
      socket.on('getRecentMessages', async (data) => {
        const { roomId, count } = data;
        const messages = await getRecentMessages(roomId, count);
        socket.emit('recentMessages', messages);
      });


      // * disconnect Logics
      socket.on('disconnect', (roomId, userMail) => {
        DeleteOnlineUsers(roomId, userMail).then(r => {
          console.log("deleted users")
        }).catch(err => {
          console.log("Error occurred ", err)
        })
        console.log('User disconnected');
      });
    });
  };
  


  module.exports = socketHandler;
  