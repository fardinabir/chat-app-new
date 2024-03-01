// src/utils/jwtUtils.js
const jwt = require('jsonwebtoken');

const generateToken = (userId, userMail) => {
  return jwt.sign({ userId, userMail }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };

