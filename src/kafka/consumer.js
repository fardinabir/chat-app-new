const {Kafka} = require('kafkajs');
const { topic: {CHAT_MESSAGES, CHAT_EVENTS} } = require('../../config');
const { TokenExpiredError } = require('jsonwebtoken');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092', 'localhost:9092']
})
const consumer = kafka.consumer({ groupId: 'kafka' })

const consume = async (io) => {
  console.log("------------ Initializing Kafka Consumer -----------")
  await consumer.connect()
  await consumer.subscribe({topic: CHAT_MESSAGES, fromBeginning: true })
  await consumer.subscribe({topic: CHAT_EVENTS, fromBeginning: true })
  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      console.log("****************** Arrived in Kafka Consumer ******************")
      console.log("--------Message Topic----------", topic)
      const obj = JSON.parse(message.value);
      console.log("our object",obj);

      if(topic === CHAT_MESSAGES){
        io.to(obj.roomId).emit('receiveMessage', obj);
      }
   }, })}

// consume()

module.exports = {consume}