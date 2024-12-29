const {Kafka} = require('kafkajs');
const { kafkaConfig } = require('../../config');
const { TokenExpiredError } = require('jsonwebtoken');
const {saveMessage} = require("../repos/chatRoom");

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [kafkaConfig.host, kafkaConfig.host]
})

const groupId = process.env.HOSTNAME  || `node-app-${Date.now()}`
const consumer = kafka.consumer({ groupId })

const consume = async (io) => {
  console.log("------------ Initializing Kafka Consumer -----------")
  await consumer.connect()
  await consumer.subscribe({topic: kafkaConfig.topic.CHAT_MESSAGES, fromBeginning: true })
  await consumer.subscribe({topic: kafkaConfig.topic.CHAT_EVENTS, fromBeginning: true })
  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      console.log("****************** Arrived in Kafka Consumer ******************")
      console.log("--------Message Topic----------", topic)
      const obj = JSON.parse(message.value);
      console.log("the received object",obj);

      if(topic === kafkaConfig.topic.CHAT_MESSAGES || topic === kafkaConfig.topic.CHAT_EVENTS){
        // await saveMessage(obj.messageText, obj.userMail, obj.isEvent, obj.roomName).then(async () => {
        //   console.log("saved message to the database")
        // }).catch(err => {
        //   console.log("Error occurred ", err)
        // })
        io.to(obj.roomName).emit('receiveMessage', obj);
      }
   },
  });

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
}

async function handleShutdown(signal) {
  console.log(`Received signal ${signal}, shutting down Kafka consumer...`);
  await consumer.disconnect();
  console.log("Kafka consumer disconnected");
  process.exit(0); // Exit the process after consumer disconnects
}
// consume()

module.exports = {consume}