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
    getMessages: async (parent, { id }, { user }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated');

        const otherUser = await models.User.findOne({
          where: { id }
        });

        if (!otherUser) throw new UserInputError('User not found');

        const ids = [user.id, otherUser.id];

        return await models.Message.findAll({
          where: {
            from: { [Op.in]: ids },
            to: { [Op.in]: ids },
          },
          order: [['createdAt', 'DESC']]
        });
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

        const recipient = await models.User.findOne({ where: { id: to } })

        if (!recipient) {
          throw new UserInputError('User not found')
        } else if (recipient.id === user.id) {
          throw new UserInputError('You cant message yourself')
        }

        if (content.trim() === '') {
          throw new UserInputError('Message is empty')
        }

        const messageObj = {
          from: user.id,
          to,
          content
        }

        const message = await models.Message.create(messageObj);

        await pubsub.publish(NEW_MESSAGE, { newMessage: messageObj, user })

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
        () => pubsub.asyncIterator(NEW_MESSAGE),
        ({ newMessage, user }) => {
          return +newMessage.from === +user.id ||
            +newMessage.to === +user.id;
        }
      )
    },
    newReaction: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['NEW_REACTION']),
        async ({ newReaction }, _, { user }) => {
          const message = await newReaction.getMessage();
          return message.from === user.id || message.to === user.id;
        }
      ),
    }
  }
}