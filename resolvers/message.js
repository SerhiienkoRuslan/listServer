const {
  UserInputError,
  AuthenticationError,
  ForbiddenError
} = require('apollo-server');
const { Op } = require('sequelize');
import { withFilter, PubSub } from 'graphql-subscriptions';

const models = require('../models');

const NEW_MESSAGE = 'NEW_MESSAGE'

const pubsub = new PubSub();

module.exports = {
  Query: {
    getMessages: async (parent, { _id }, { user }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated');

        const otherUser = await models.User.findOne({
          where: { _id }
        });

        if (!otherUser) throw new UserInputError('User not found');

        const ids = [user._id, otherUser._id];

        return await models.Message.findAll({
          where: {
            from: { [Op.in]: ids },
            to: { [Op.in]: ids },
          },
          order: [['createdAt', 'DESC']],
          include: ['user']
        });
      } catch (err) {
        console.log(err)
        throw err
      }
    },
  },
  Mutation: {
    sendMessage: async (parent, { to, text, ...rest }, { user }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated')

        const recipient = await models.User.findOne({ where: { _id: to } })
        const current = await models.User.findOne({ where: { _id: user._id } })

        if (!recipient) {
          throw new UserInputError('User not found')
        } else if (recipient._id === user._id) {
          throw new UserInputError('You cant message yourself')
        }

        if (text.trim() === '') {
          throw new UserInputError('Message is empty')
        }

        const messageObj = {
          ...rest,
          from: user._id,
          to,
          text,
          userId: user._id
        }

        const message = await models.Message.create(messageObj, { include: ['user'] });

        await pubsub.publish(NEW_MESSAGE, { newMessage: { ...message.dataValues, user: current.dataValues }, user })

        return message
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    reactToMessage: async (_, { uuid, content }, { user }) => {
      const reactions = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎'];

      try {
        // Validate reaction content
        if (!reactions.includes(content)) {
          throw new UserInputError('Invalid reaction')
        }

        // Get user
        const userId = user ? user._id : '';
        user = await models.User.findOne({ where: { _id: userId } });
        if (!user) throw new AuthenticationError('Unauthenticated');

        // Get message
        const message = await models.Message.findOne({ where: { uuid } });
        if (!message) throw new UserInputError('message not found');

        if (message.from !== user._id && message.to !== user._id) {
          throw new ForbiddenError('Unauthorized')
        }

        let reaction = await models.Reaction.findOne({
          where: { messageId: message._id, userId: user._id },
        })

        if (reaction) {
          // Reaction exists, update it
          reaction.content = content
          await reaction.save()
        } else {
          // Reaction doesnt exists, create it
          reaction = await models.Reaction.create({
            messageId: message._id,
            userId: user._id,
            content,
          })
        }

        pubsub.publish('NEW_REACTION', { newReaction: reaction })

        return reaction
      } catch (err) {
        throw err
      }
    }
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NEW_MESSAGE),
        ({ newMessage, user }) => {
          console.log(newMessage)
          return +newMessage.from === +user._id ||
            +newMessage.to === +user._id;
        }
      )
    },
    newReaction: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['NEW_REACTION']),
        async ({ newReaction }, _, { user }) => {
          const message = await newReaction.getMessage();
          return message.from === user._id || message.to === user._id;
        }
      ),
    }
  }
}