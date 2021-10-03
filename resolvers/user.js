const { AuthenticationError } = require('apollo-server');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const { Op } = require('sequelize');

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

    async getUsers(_, __, { user }) {
      try {
        if (!user) throw new Error('You are not authenticated!')

        let users = await models.User.findAll({
          raw: true,
          attributes: ['id', 'username', 'createdAt'],
          where: { id: { [Op.ne]: user.id } }
        })

        const allUserMessages = await models.Message.findAll({
          raw: true,
          where: {
            [Op.or]: [{ from: user.id || '' }, { to: user.id || '' }],
          },
          order: [['createdAt', 'DESC']]
        })

        return users ? users.map((otherUser) => {
          const currentOtherUser = { ...otherUser };

          currentOtherUser.latestMessage = allUserMessages.find(
            (m) => +m.from === +currentOtherUser.id || +m.to === +currentOtherUser.id
          );
          return currentOtherUser;
        }) : [];
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