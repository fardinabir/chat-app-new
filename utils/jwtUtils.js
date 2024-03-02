// src/utils/jwtUtils.js
const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (userId, userMail) => {
  return jwt.sign({ userId, userMail }, process.env.JWT_SECRET, { expiresIn: config.jwt_expiry });
};

const verifyToken = (token) => {
  try {
      return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.log(err);
    return {err}
  }
};

module.exports = { generateToken, verifyToken };

