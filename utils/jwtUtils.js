// src/utils/jwtUtils.js
const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (userId, userMail) => {
  return jwt.sign({ userId, userMail }, config.jwt_secret, { expiresIn: config.jwt_expiry });
};

const verifyToken = (token) => {
  try {
      return jwt.verify(token, config.jwt_secret);
  } catch (err) {
    console.log(err);
    return {err}
  }
};

module.exports = { generateToken, verifyToken };

