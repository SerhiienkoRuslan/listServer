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
  HOST: 'eu-cdbr-west-02.cleardb.net',
  USER: 'baef10bb942aa4',
  PASSWORD: '2df4469f',
  DB: 'heroku_8f8fa8607d3081d',
  dialect: 'mysql'
}

module.exports = {
  development: dbDetails,
  production: dbDetailsProd
}