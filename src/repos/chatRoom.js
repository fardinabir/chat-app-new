const Message = require('../models/Message');
const {saveMessageToRedis, getRecentMessages, cacheRecentMessages} = require("../../utils/redisUtils");
const recentMessages = 20

async function saveMessage(data) {
    console.log("---------saving data-------");

    try {
        const message = await Message.create({
            message_text: data.message,
            sender_mail: "dummy",
            is_event: false,
            room_id: data.roomId,
        });

        console.log("Message created successfully:", JSON.stringify(message));

        await saveMessageToRedis(data.roomId, message);
        console.log("Successfully added caching to redis");

        return message.id;
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
