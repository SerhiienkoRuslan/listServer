const userResolvers = require('./user');
const postResolvers = require('./post');
const messageResolvers = require('./message');
const models = require('../models');

require('dotenv').config()

const resolvers = {
  Message: {
    createdAt: (parent) => parent.createdAt.toISOString()
  },
  // Reaction: {
  //   createdAt: (parent) => parent.createdAt.toISOString(),
  //   message: async (parent) => await models.Message.findByPk(parent.id),
  //   user: async (parent) =>
  //     await models.User.findByPk(parent.id, {
  //       attributes: ['username', 'createdAt'],
  //     })
  // },
  User: {
    createdAt: (user) => user.createdAt.toISOString()
  },
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...messageResolvers.Query
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...messageResolvers.Mutation
  }
}

module.exports = resolvers
