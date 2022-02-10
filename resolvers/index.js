const userResolvers = require('./user');
const postResolvers = require('./post');
const messageResolvers = require('./message');

require('dotenv').config()

const resolvers = {
  Message: {
    createdAt: (parent) => parent.createdAt.toISOString()
  },
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
  },
  Subscription: {
    ...messageResolvers.Subscription,
  }
}

module.exports = resolvers
