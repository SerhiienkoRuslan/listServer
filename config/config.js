require('dotenv').config()

// for dev
const dbDetails = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: 'mysql'
}

// for prod
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