'use strict'
const bcrypt = require('bcryptjs')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const password = await bcrypt.hash('123456', 10);
    const createdAt = new Date();
    const updatedAt = createdAt;

    await queryInterface.bulkInsert('users', [
      {
        username: 'john',
        email: 'john@email.com',
        password: password,
        createdAt,
        updatedAt,
      },
      {
        username: 'jane',
        email: 'jane@email.com',
        password: password,
        createdAt,
        updatedAt,
      },
      {
        username: 'boss',
        email: 'boss@email.com',
        password: password,
        createdAt,
        updatedAt,
      },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {})
  },
}