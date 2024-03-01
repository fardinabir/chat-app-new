// src/utils/redisUtils.js
const redis = require('redis');


const redisConfig = {
  host: 'localhost', 
  port: 6389, 
};

const client = redis.createClient(redisConfig);

const saveMessageToRedis = (roomId, message) => {
  console.log("A message landed --------- ", roomId, message)
  client.lpush(roomId, JSON.stringify(message));
};

const getRecentMessages = async (roomId, count) => {
  return new Promise((resolve, reject) => {
    client.lrange(roomId, 0, count - 1, (err, messages) => {
      if (err) {
        reject(err);
      } else {
        resolve(messages.map((message) => JSON.parse(message)));
      }
    });
  });
};

module.exports = { saveMessageToRedis, getRecentMessages };
