const { AuthenticationError } = require('apollo-server');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const { Op } = require('sequelize');

const models = require('../models');

module.exports = {
  Query: {
    async me(_, args, { user }) {
      if (!user) throw new AuthenticationError('Unauthenticated!')

      try {
        return await models.User.findByPk(user._id)
      } catch (e) {
        console.log(e)
      }
    },

    async user(root, { _id }, { user }) {
      if (!user) throw new AuthenticationError('Unauthenticated!')

      try {
        return models.User.findByPk(_id)
      } catch (error) {
        throw new Error(error.message)
      }
    },

    async getUsers(_, __, { user }) {
      if (!user) throw new AuthenticationError('Unauthenticated!')

      try {
        let users = await models.User.findAll({
          raw: true,
          attributes: ['_id', 'name', 'createdAt'],
          where: { _id: { [Op.ne]: user._id } }
        })

        const allUserMessages = await models.Message.findAll({
          raw: true,
          where: {
            [Op.or]: [{ from: user._id || '' }, { to: user._id || '' }],
          },
          order: [['createdAt', 'DESC']]
        })

        return users ? users.map((otherUser) => {
          const currentOtherUser = { ...otherUser };

          currentOtherUser.latestMessage = allUserMessages.find(
            (m) => +m.from === +currentOtherUser._id || +m.to === +currentOtherUser._id
          );
          return currentOtherUser;
        }) : [];
      } catch (error) {
        throw new Error(error.message)
      }
    }
  },
  Mutation: {
    async registerUser(root, { name, email, password }) {
      try {
        const user = await models.User.create({
          name,
          email,
          password: await bcrypt.hash(password, 10)
        });

        const token = jsonwebtoken.sign(
          { _id: user._id, email: user.email},
          process.env.JWT_SECRET,
          { expiresIn: '1y' }
        );

        return {
          token, _id: user._id, name: user.name, email: user.email, message: "Authentication successfully"
        }
      } catch (error) {
        console.log(error)
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
          { _id: user._id, email: user.email},
          process.env.JWT_SECRET,
          { expiresIn: '1d'}
        )

        return { token, user }
      } catch (error) {
        throw new Error(error.message)
      }
    },

    async updateProfile(root, { name, email, _id }, { user }) {
      if (!user) throw new AuthenticationError('Unauthenticated!')

      try {
        const updatedUser = await models.User.findByPk(_id);

        if (!updatedUser) {
          throw new Error("User doesn't exist");
        }

        updatedUser.name = name || updatedUser.name;
        updatedUser.email = email || updatedUser.email;
        await updatedUser.save();
        return updatedUser;
      } catch (e) {
        throw new Error('Id is required')
      }
    }
  }
}