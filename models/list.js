const Sequelize = require('sequelize')
const sequelize = require('../utils/database')

const list = sequelize.define('List', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: Sequelize.INTEGER
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

module.exports = list