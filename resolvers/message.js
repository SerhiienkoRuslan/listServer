const { UserInputError, AuthenticationError } = require('apollo-server');
const { Op } = require('sequelize');

const { Message, User } = require('../models');

module.exports = {
  Query: {
    getMessages: async (parent, { from }, { user }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated')

        const otherUser = await User.findOne({
          where: { username: from },
        })
        if (!otherUser) throw new UserInputError('User not found')

        const usernames = [user.username, otherUser.username]

        return await Message.findAll({
          where: {
            from: { [Op.in]: usernames },
            to: { [Op.in]: usernames },
          },
          order: [['createdAt', 'DESC']],
        })
      } catch (err) {
        console.log(err)
        throw err
      }
    },
  },
  Mutation: {
    sendMessage: async (parent, { to, content }, { user }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated')

        const recipient = await User.findOne({ where: { username: to } })

        if (!recipient) {
          throw new UserInputError('User not found')
        } else if (recipient.username === user.username) {
          throw new UserInputError('You cant message yourself')
        }

        if (content.trim() === '') {
          throw new UserInputError('Message is empty')
        }

        return await Message.create({
          from: user.username,
          to,
          content,
        })
      } catch (err) {
        console.log(err)
        throw err
      }
    },
  },
}