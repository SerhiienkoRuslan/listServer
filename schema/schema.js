const { gql } = require('apollo-server')

const typeDefs = gql`
  type Post {
    id: Int!
    title: String!
    content: String!
    createdAt: String
    updatedAt: String
  }
  
  type User {
    _id: Int!
    name: String!
    createdAt: String!
    email: String
    latestMessage: Message
    avatar: String
  }

  type Message {
    _id: Int!
    text: String!
    from: String!
    to: String!
    user: User!
    createdAt: String!
    reactions: [Reaction]
  }

  type Reaction {
    uuid: String!
    content: String!
    createdAt: String!
    message: Message!
    user: User!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    user(_id: Int!): User
    getUsers: [User!]!
    me: User
    getPosts: [Post!]!
    getPost(id: Int!): Post
    getMessages(_id: Int!): [Message]!
  }

  input PostInput {
    title: String!
    content: String!
  }

  type Mutation {
    # User
    registerUser(name: String, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateProfile(_id: Int!, email: String, name: String): User!
    # Post
    createPost(post: PostInput!): Post!
    updatePost(id: ID!): Post!
    deletePost(id: ID!): Boolean!
    # Message
    sendMessage(to: Int!, text: String!): Message!
    reactToMessage(uuid: String!, content: String!): Reaction!
  }

  type Subscription {
    newMessage: Message
    newReaction: Reaction!
  }
`

module.exports = typeDefs
