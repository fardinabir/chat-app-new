// src/models/ChatRoom.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const ChatRoom = sequelize.define('ChatRoom', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  id
});

module.exports = ChatRoom;
