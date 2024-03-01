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
  console.log("--------A message landed for Redis --------- ");
  const key = `room_id_${roomId}`;
  try {

    // Push the new message to the list
    const res1 = await client.lPush(key, JSON.stringify(message));
    if (res1 === 0) {
      console.log("Could not set data to redis")
    } else {
      console.log("Set data to redis under key ", key)
    }

  } catch (error) {
    console.error("Error saving message to Redis:", error);
  }
}
async function cacheRecentMessages(roomId, messages) {
  const messageData = messages.map((message) => JSON.stringify(message));
  const key = `room_id_${roomId}`;
  try {
    for (const message of messageData) {
      // Push the new message to the list
      const res1 = await client.lPush(key, JSON.stringify(message));
      if (res1 === 0) {
        console.log("Could not set data to redis")
      } else {
        console.log("Set data to redis")
      }
    }
  } catch (error) {
    console.error('Error caching messages:', error);
  }
}

async function getRecentMessages(roomId, count) {
  const key = `room_id_${roomId}`;
  const messages = await client.lRange(key, 0, count-1);
  return messages.map((message) => JSON.parse(message));
}

const setUserActive = ({roomId, userMail, status}) => {
  // set to redis, make active/delete
}

const getUserActive = (roomId) => {
  // fetch active list of users from redis
}

module.exports = { saveMessageToRedis, getRecentMessages, cacheRecentMessages, getUserActive, setUserActive };
