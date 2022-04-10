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
  host: 'eu-cdbr-west-02.cleardb.net',
  user: 'baef10bb942aa4',
  password: '2df4469f',
  database: 'heroku_8f8fa8607d3081d',
  dialect: 'mysql'
}

module.exports = {
  development: dbDetails,
  production: dbDetailsProd
}