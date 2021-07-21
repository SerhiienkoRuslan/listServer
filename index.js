const { ApolloServer } = require('apollo-server');
const jwt =  require('jsonwebtoken');
const typeDefs = require('./schema/schema');
const resolvers = require('./resolvers/resolvers');

require('dotenv').config();

const { JWT_SECRET, PORT } = process.env;

const getUser = token => {
  try {
    if (token) {
      return jwt.verify(token, JWT_SECRET)
    }
    return null
  } catch (error) {
    return null
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.get('Authorization') || ''
    return { user: getUser(token.replace('Bearer', ''))}
  },
  fetchOptions: {
    mode: 'no-cors'
  },
  introspection: true,
  playground: true
})

server.listen({ port: process.env.PORT || 5000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});