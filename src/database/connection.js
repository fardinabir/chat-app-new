// src/database/connection.js
const { Sequelize } = require('sequelize');
const config = require('../../config');

const sequelize = new Sequelize(config.database);

module.exports = sequelize;

