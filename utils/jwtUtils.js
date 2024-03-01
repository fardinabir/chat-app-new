// src/utils/jwtUtils.js
const jwt = require('jsonwebtoken');

const generateToken = (userId, userMail) => {
  return jwt.sign({ userId, userMail }, process.env.JWT_SECRET, { expiresIn: '2h' });
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

