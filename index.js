const { ApolloServer } = require('apollo-server');
import { PubSub } from 'graphql-subscriptions';
const jwt =  require('jsonwebtoken');
const typeDefs = require('./schema/schema');
const resolvers = require('./resolvers');

require('dotenv').config();

const { JWT_SECRET, PORT } = process.env;

const getUser = token => {
  try {
    if (token) return jwt.verify(token, JWT_SECRET)
    return null
  } catch (error) {
    return null
  }
};

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.get('Authorization') || '';
    return { user: getUser(token.replace('Bearer', '')), pubsub }
  },
  subscriptions: { path: '/' },
  fetchOptions: {
    mode: 'no-cors'
  },
  introspection: true,
  playground: true
})

server.listen({ port: PORT || 5000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});