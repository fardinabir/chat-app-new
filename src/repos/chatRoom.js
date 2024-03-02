const Message = require('../models/Message');
const {saveMessageToRedis, getRecentMessages, cacheRecentMessages} = require("../../utils/redisUtils");
const recentMessages = 20

async function saveMessage(messageBody, mail, isEvent, roomId) {
    console.log("---------saving data-------");

    try {
        const message = await Message.create({
            message_text: messageBody,
            sender_mail: mail,
            is_event: isEvent,
            room_id: roomId,
        });

        console.log("Message created successfully:", message.dataValues);

        await saveMessageToRedis(roomId, message);
        console.log("Successfully added caching to redis");

        return message.dataValues;
    } catch (error) {
        console.error("Error saving message:", error);
        throw error; // Re-throw the error to propagate it
    }
}

const getMessage = async function (roomId) {
    try {
        // Try retrieving messages from Redis
        let messages = await getRecentMessages(roomId, recentMessages);
        // Fallback to database if Redis is unavailable or messages are empty
        if (!messages || messages.length === 0) {
            messages = await Message.findAll({
                where: {
                    room_id: roomId,
                },
                limit: 20, // Retrieve only the last 20 messages
                order: [['createdAt', 'DESC']], // Order by creation time (recent first)
            });
            await cacheRecentMessages(roomId, messages); // Cache retrieved messages
        }

        return messages;
    } catch (error) {
        let messages = await Message.findAll({
            where: {
                room_id: roomId,
            },
            limit: 20, // Retrieve only the last 20 messages
            order: [['createdAt', 'DESC']], // Order by creation time (recent first)
        });
        await cacheRecentMessages(roomId, messages); // Cache retrieved messages
        console.log("Error retrieving message from redis ", error)
        return messages

    }
  };

module.exports = { saveMessage, getMessage };
