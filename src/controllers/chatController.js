// src/controllers/chatController.js
const { saveMessage, getRecentMessages } = require('../../utils/redisUtils');
const sequelize = require('../database/connection');
const ChatRoom = require('../models/ChatRoom');
const {getMessage, getRoomName} = require('../repos/chatRoom')

const createChatRoom = async (req, res) => {
  try {
    const { name } = req.body;
    const chatRoom = await ChatRoom.create({ name });
    res.json(chatRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const listChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.findAll();
    res.json(chatRooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const roomName = await getRoomName(id)
    const messages = await getMessage(roomName)
    console.log("--------- retrived messages ------\n", roomName, messages)
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { createChatRoom, listChatRooms, getChatMessages };
