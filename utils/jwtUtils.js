// src/utils/jwtUtils.js
const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (userId, userMail) => {
  return jwt.sign({ userId, userMail }, config.jwt_secret, { expiresIn: config.jwt_expiry });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwt_secret);
};


module.exports = { generateToken, verifyToken };

