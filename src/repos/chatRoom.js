const Message = require('../models/Message');

const saveMessage = (message, mail, is_event, roomId) => {
    // saveMessageToRedis(roomId, message);
    console.log("---------saving data-------",message, mail, is_event, roomId)
    const msg = Message.create({ message_text: message, sender_mail: mail, is_event: is_event, room_id : roomId });
    return msg
}

const getMessage = async function (roomId) {
    try {
      const message = await Message.findAll({
        where: { room_id: roomId }
      });
      // console.log("--------- retrived messages ------", message)
      return message;
    } catch (error) {
      throw new Error(`Error retrieving message by ID: ${error.message}`);
    }
  };

module.exports = { saveMessage, getMessage };
