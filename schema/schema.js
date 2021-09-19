const { gql } = require('apollo-server')

const typeDefs = gql`
  type Post {
    id: ID!
    title: String!
    content: String!
    createdAt: String
    updatedAt: String
  }

  type User {
    id: Int!
    username: String
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Message {
      uuid: String!
      content: String!
      from: String!
      to: String!
      createdAt: String!
  }

  type Query {
    user(id: Int!): User
    allUsers: [User!]!
    me: User
    getPosts: [Post!]!
    getPost(id: ID!): Post
    getMessages(from: String!): [Message]!
  }

  input PostInput {
    title: String!
    content: String!
  }

  type Mutation {
    # User
    registerUser(username: String, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateProfile(id: Int!, email: String, username: String): User!
    # Post
    createPost(post: PostInput!): Post!
    updatePost(id: ID!): Post!
    deletePost(id: ID!): Boolean!
    # Message
    sendMessage(to: String!, content: String!): Message!
  }
`

module.exports = typeDefs