const userResolvers = require('./user');
const postResolvers = require('./post');
const messageResolvers = require('./message');

require('dotenv').config()

const resolvers = {
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
