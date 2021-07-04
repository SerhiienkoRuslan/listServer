const {buildSchema} = require('graphql')

module.exports = buildSchema(`
  type List {
    id: ID!
    title: String!
    createdAt: String
    updatedAt: String
  }

  type Query {
    getLists: [List!]!
  }

  input ListInput {
    title: String!
  }

  type Mutation {
    createList(list: ListInput!): List!
    updateList(id: ID!): List!
    deleteList(id: ID!): Boolean!
  }
`)