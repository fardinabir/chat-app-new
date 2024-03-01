// src/utils/redisUtils.js
const redis = require('redis');

const client = redis.createClient();

client.on('error', err => console.log('Redis Client Error ', err));

client.connect().then(async () => {
  console.log('Successfully connected to Redis server!');

  process.on('SIGINT', () => {
    client.quit()
        .then(() => console.log('Disconnected from Redis server'))
        .catch(err => console.error('Error disconnecting from Redis: ', err));
  });
}).catch(err => {
  console.error('Error connecting to Redis:', err);
});

async function saveMessageToRedis(roomId, message) {
  console.log("A message landed --------- ", roomId, message);
  try {
    // Push the new message to the list
    await client.lpush(roomId, JSON.stringify(message));

    // Trim the list to a maximum of 20 messages
    await client.ltrim(roomId, 0, 19); // Keep the most recent 20
  } catch (error) {
    console.error("Error saving message to Redis:", error);
  }
}
async function cacheRecentMessages(roomId, messages) {
  const messageData = messages.map((message) => JSON.stringify(message));

  try {
    for (const message of messageData) {
      await client.lpush(`recent_messages:${roomId}`, message);
    }
  } catch (error) {
    console.error('Error caching messages:', error);
    // Consider alternative actions if caching fails, like logging or using a fallback mechanism
  }
}

async function getRecentMessages(roomId) {
  const messages = await client.lrange(`recent_messages:${roomId}`, 0, -1);
  return messages.map((message) => JSON.parse(message));
}

const setUserActive = ({roomId, userMail, status}) => {
  // set to redis, make active/delete
}

const getUserActive = (roomId) => {
  // fetch active list of users from redis
}

module.exports = { saveMessageToRedis, getRecentMessages, cacheRecentMessages, getUserActive, setUserActive };
