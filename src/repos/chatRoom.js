const Message = require('../models/Message');
const {saveMessageToRedis, getRecentMessages, cacheRecentMessages} = require("../../utils/redisUtils");

const saveMessage = (data) => {
    console.log("---------saving data-------",data)
    const message = Message.create({ message_text: data.message, sender_mail: "dummy", is_event: false, room_id : data.roomId });
    saveMessageToRedis(data.roomId, message).then(r => {
        console.log("Successfully added caching to redis")
    }).catch(err => {
        console.log("Error occurred while caching ", err)
    });
    return message.id
}

const getMessage = async function (roomId) {
    try {
        // Try retrieving messages from Redis
        let messages = await getRecentMessages(roomId);
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
      throw new Error(`Error retrieving message by ID: ${error.message}`);
    }
  };

module.exports = { saveMessage, getMessage };
