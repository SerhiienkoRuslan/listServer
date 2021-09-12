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

  type Query {
    user(id: Int!): User
    allUsers: [User!]!
    me: User
    getPosts: [Post!]!
    getPost(id: ID!): Post
  }

  input PostInput {
    title: String!
    content: String!
  }

  type Mutation {
    # User
    registerUser(username: String, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateProfile(email: String, username: String): User!
    # Post
    createPost(post: PostInput!): Post!
    updatePost(id: ID!): Post!
    deletePost(id: ID!): Boolean!
  }
`

module.exports = typeDefs