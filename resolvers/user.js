const { AuthenticationError } = require('apollo-server');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const models = require('../models');

module.exports = {
  Query: {
    async me(_, args, { user }) {
      if (!user) throw new AuthenticationError('Unauthenticated')

      return await models.User.findByPk(user.id)
    },

    async user(root, { id }, { user }) {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated')

        return models.User.findByPk(id)
      } catch (error) {
        throw new Error(error.message)
      }
    },

    async allUsers(root, args, { user }) {
      try {
        if (!user) throw new Error('You are not authenticated!')
        return models.User.findAll()
      } catch (error) {
        throw new Error(error.message)
      }
    }
  },
  Mutation: {
    async registerUser(root, { username, email, password }) {
      try {
        const user = await models.User.create({
          username,
          email,
          password: await bcrypt.hash(password, 10)
        });

        const token = jsonwebtoken.sign(
          { id: user.id, email: user.email},
          process.env.JWT_SECRET,
          { expiresIn: '1y' }
        );

        return {
          token, id: user.id, username: user.username, email: user.email, message: "Authentication successfully"
        }
      } catch (error) {
        throw new Error(error.message)
      }
    },

    async login(_, { email, password }) {
      try {
        const user = await models.User.findOne({ where: { email }});

        if (!user) {
          throw new Error('No user with that email')
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          throw new Error('Incorrect password')
        }

        const token = jsonwebtoken.sign(
          { id: user.id, email: user.email},
          process.env.JWT_SECRET,
          { expiresIn: '1d'}
        )

        return { token, user }
      } catch (error) {
        throw new Error(error.message)
      }
    },

    async updateProfile(root, { username, email, id }) {
      try {
        const updatedUser = await models.User.findByPk(id);

        if (!updatedUser) {
          throw new Error("User doesn't exist");
        }

        updatedUser.username = username || updatedUser.username;
        updatedUser.email = email || updatedUser.email;
        await updatedUser.save();
        return updatedUser;
      } catch (e) {
        throw new Error('Id is required')
      }
    }
  }
}