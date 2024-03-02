const {Kafka} = require('kafkajs');
const { topic: {CHAT_MESSAGES, CHAT_EVENTS} } = require('../../config');

const kafka = new Kafka({
  clientId: 'my-app',
  //your kafka container port
  brokers: ['localhost:9092', 'localhost:9092']
})

const producer = kafka.producer()
const produce = async (res,  topic) => {
    await producer.connect();
    await producer.send({
        topic,
        //convert value to a JSON string and send it
        messages: [{
            value: JSON.stringify(res) }]
    });
    console.log('Message sent successfully', res)

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
}

async function handleShutdown(signal) {
    console.log(`Received signal ${signal}, shutting down Kafka producer...`);
    await producer.disconnect();
    console.log("Kafka producer disconnected");
    process.exit(0); // Exit the process after consumer disconnects
}

// produce("hello polok, kafka is working.............", CHAT_EVENTS)

module.exports = {produce}