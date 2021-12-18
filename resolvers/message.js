const {
  UserInputError,
  AuthenticationError,
  ForbiddenError
} = require('apollo-server');
const { Op } = require('sequelize');
import { withFilter } from 'graphql-subscriptions';

const models = require('../models');

module.exports = {
  Query: {
    getMessages: async (parent, { id }, { user }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated');

        const otherUser = await models.User.findOne({
          where: { id }
        });

        if (!otherUser) throw new UserInputError('User not found');

        const ids = [user.id, otherUser.id];

        const messages = await models.Message.findAll({
          where: {
            from: { [Op.in]: ids },
            to: { [Op.in]: ids },
          },
          order: [['createdAt', 'DESC']]
        })

        return messages;
      } catch (err) {
        console.log(err)
        throw err
      }
    },
  },
  Mutation: {
    sendMessage: async (parent, { to, content }, { user, pubsub }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated')

        const recipient = await models.User.findOne({ where: { id: to } })

        if (!recipient) {
          throw new UserInputError('User not found')
        } else if (recipient.id === user.id) {
          throw new UserInputError('You cant message yourself')
        }

        if (content.trim() === '') {
          throw new UserInputError('Message is empty')
        }

        const message = await models.Message.create({
          from: user.id,
          to,
          content,
        });

        pubsub.publish('NEW_MESSAGE', { newMessage: message })

        return message
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    reactToMessage: async (_, { uuid, content }, { user, pubsub }) => {
      const reactions = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎'];

      try {
        // Validate reaction content
        if (!reactions.includes(content)) {
          throw new UserInputError('Invalid reaction')
        }

        // Get user
        const userId = user ? user.id : '';
        user = await models.User.findOne({ where: { id: userId } });
        if (!user) throw new AuthenticationError('Unauthenticated');

        // Get message
        const message = await models.Message.findOne({ where: { uuid } });
        if (!message) throw new UserInputError('message not found');

        if (message.from !== user.id && message.to !== user.id) {
          throw new ForbiddenError('Unauthorized')
        }

        let reaction = await models.Reaction.findOne({
          where: { messageId: message.id, userId: user.id },
        })

        if (reaction) {
          // Reaction exists, update it
          reaction.content = content
          await reaction.save()
        } else {
          // Reaction doesnt exists, create it
          reaction = await models.Reaction.create({
            messageId: message.id,
            userId: user.id,
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
        (_, __, { user, pubsub }) => {
          if (!user) throw new AuthenticationError('Unauthenticated');
          return pubsub.asyncIterator('NEW_MESSAGE');
        },
        ({ newMessage }, _, { user }) => {
          return +newMessage.from === +user.id ||
            +newMessage.to === +user.id;
        }
      )
    },
    newReaction: {
      subscribe: withFilter(
        (_, __, { pubsub, user }) => {
          if (!user) throw new AuthenticationError('Unauthenticated');
          return pubsub.asyncIterator('NEW_REACTION');
        },
        async ({ newReaction }, _, { user }) => {
          const message = await newReaction.getMessage();
          return message.from === user.id || message.to === user.id;
        }
      ),
    }
  }
}