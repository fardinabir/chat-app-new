// src/database/connection.js
const { Sequelize } = require('sequelize');
const config = require('../../config');

const sequelize = new Sequelize(config.development);

module.exports = sequelize;

