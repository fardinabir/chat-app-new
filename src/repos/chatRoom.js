const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');
const {saveMessageToRedis, getRecentMessages, cacheRecentMessages} = require("../../utils/redisUtils");
const recentMessages = 20

async function saveMessage(messageBody, mail, isEvent, roomName) {
    console.log("---------saving data-------",messageBody, mail, isEvent, roomName);

    try {
        const message = await Message.create({
            message_text: messageBody,
            sender_mail: mail,
            is_event: isEvent,
            room_name: roomName,
        });

        console.log("Message created successfully:", message.dataValues);

        await saveMessageToRedis(roomName, message);
        console.log("Successfully added caching to redis");

        return message.dataValues;
    } catch (error) {
        console.error("Error saving message:", error);
        throw error; // Re-throw the error to propagate it
    }
}

const getMessage = async function (roomName) {
    try {
        // Try retrieving messages from Redis
        let messages = await getRecentMessages(roomName, recentMessages);
        // Fallback to database if Redis is unavailable or messages are empty
        if (!messages || messages.length === 0) {
            messages = await Message.findAll({
                where: {
                    room_name: roomName,
                },
                limit: 20, // Retrieve only the last 20 messages
                order: [['createdAt', 'DESC']], // Order by creation time (recent first)
            });
            await cacheRecentMessages(roomName, messages); // Cache retrieved messages
        }

        return messages;
    } catch (error) {
        let messages = await Message.findAll({
            where: {
                room_name: roomName,
            },
            limit: 20, // Retrieve only the last 20 messages
            order: [['createdAt', 'DESC']], // Order by creation time (recent first)
        });
        await cacheRecentMessages(roomName, messages); // Cache retrieved messages
        console.log("Error retrieving message from redis ", error)
        return messages

    }
  };

const getRoomName = async function (chatRoomId) {
    console.log("------ChatRoomId------", chatRoomId)
    try {
        const chatRoom = await ChatRoom.findOne({
            attributes: ['name'],
            where: {
                id: chatRoomId,
            },
        });

        if (chatRoom) {
            console.log('Chat Room Name:', chatRoom.name);
            return chatRoom.name
        } else {
            console.log('Chat Room not found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

module.exports = { saveMessage, getMessage, getRoomName };
