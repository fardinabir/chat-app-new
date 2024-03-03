// src/models/Message.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const ChatRoom = require('./ChatRoom');

const Message = sequelize.define('Message', {
  message_text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sender_mail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_event: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  room_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Message.belongsTo(ChatRoom, {
  foreignKey: 'room_name',
  targetKey: 'name'
});

module.exports = Message;
