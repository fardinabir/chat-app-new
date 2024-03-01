const Message = require('../models/Message');

const saveMessage = (data) => {
    // saveMessageToRedis(roomId, message);
    console.log("---------saving data-------",data)
    const message = Message.create({ message_text: data.message, sender_mail: "dummy", is_event: false, room_id : data.roomId });
    return message.id
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
