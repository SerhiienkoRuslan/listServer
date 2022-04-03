const { createServer } = require("http");
const express = require("express");
const cors = require("cors");
const { execute, subscribe } = require("graphql");
const { ApolloServer } = require("apollo-server-express");
const { PubSub } = require("graphql-subscriptions");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");

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

const corsOptions = {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "allowedHeaders": ["Content-Type"]
}

(async () => {
  const app = express();
  const httpServer = createServer(app);
  const pubsub = new PubSub();

  app.use(cors(corsOptions));

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const subscriptionServer = SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: '/graphql' }
  );

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const token = req.get('Authorization') || '';
      return {
        user: getUser(token.replace('Bearer', '')),
        pubsub
      }
    },
    subscriptions: {
      path: "/",
      onConnect: () => {
        console.log("Client connected for subscriptions");
      },
      onDisconnect: () => {
        console.log("Client disconnected from subscriptions");
      },
    },
    plugins: [{
      async serverWillStart() {
        return {
          async drainServer() {
            subscriptionServer.close();
          }
        };
      }
    }],
    fetchOptions: {
      mode: 'no-cors'
    },
    introspection: true,
    playground: true
  });

  await server.start();

  server.applyMiddleware({ app });

  httpServer.listen(PORT, () => {
    console.log(
      `🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(
      `🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`
    );
  });
})();
