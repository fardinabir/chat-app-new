const {Kafka} = require('kafkajs');
const { kafkaConfig } = require('../../config');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [kafkaConfig.host, kafkaConfig.host]
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

module.exports = {produce}