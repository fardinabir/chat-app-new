// config.js
module.exports = {
  database: {
    username: 'user',
    password: '1234',
    database: 'chat-app',
    host: '192.168.38.212',
    dialect: 'mysql',
  },
  production: {
    // Production configuration
    // ...
  },
  topic: {
    CHAT_MESSAGES: "chat-messages",
    CHAT_EVENTS: "chat-events"
  },
  jwt_expiry: '2h',
  jwt_secret: "a_strong_secret_key",
  redisConfig : {
    url: 'redis://192.168.38.212:6389'
  },
  kafkaConfig : {
    host: '192.168.38.212:9092'
  }
};

// docker run --name mysql-container -e MYSQL_ROOT_PASSWORD=root-pw -e MYSQL_DATABASE=chat-app -e MYSQL_USER=user -e MYSQL_PASSWORD=1234 -d -p 3306:3306 mysql:latest

// docker run --name redis-container -p 6389:6379 -d redis:latest

// docker run -p 2181:2181 zookeeper


