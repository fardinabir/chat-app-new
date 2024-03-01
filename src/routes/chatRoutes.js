// src/routes/chatRoutes.js
const express = require('express');
const { createChatRoom, listChatRooms, getChatMessages } = require('../controllers/chatController');

const router = express.Router();

router.post('/chat', createChatRoom);
router.get('/chat', listChatRooms);
router.get('/chat/:id/messages', getChatMessages);

module.exports = router;

