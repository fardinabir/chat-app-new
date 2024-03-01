// config.js
module.exports = {
    development: {
      username: 'user',
      password: '1234',
      database: 'chat-app',
      host: 'localhost',
      dialect: 'mysql',
    },
    production: {
      // Production configuration
      // ...
    },
  };

  // docker run --name mysql-container -e MYSQL_ROOT_PASSWORD=root-pw -e MYSQL_DATABASE=chat-app -e MYSQL_USER=user -e MYSQL_PASSWORD=1234 -d -p 3306:3306 mysql:latest

  // docker run --name redis-container -p 6389:6379 -d redis:latest

  