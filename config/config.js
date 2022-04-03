require('dotenv').config()

const dbDetails = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: 'mysql'
}

const dbDetailsProd = {
  username: 'root',
  password: null,
  database: 'database',
  dialect: 'mysql'
}

module.exports = {
  development: dbDetails,
  production: dbDetailsProd
}