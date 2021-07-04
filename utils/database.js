const Sequelize = require('sequelize')

const DB_NAME = 'products-db'
const USER_NAME = 'root'
const PASSWORD = 'password'

const sequelize = new Sequelize(DB_NAME, USER_NAME, PASSWORD, {
  host: 'localhost',
  dialect: 'mysql'
})

module.exports = sequelize