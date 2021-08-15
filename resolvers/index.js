const bcrypt = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')
const models = require('../models')

require('dotenv').config()

const index = {
  Query: {
    async me(_, args, { user }) {
      if(!user) throw new Error('You are not authenticated')

      return await models.User.findByPk(user.id)
    },

    async user(root, { id }, { user }) {
      try {
        if(!user) throw new Error('You are not authenticated!')
        return models.User.findByPk(id)
      } catch (error) {
        throw new Error(error.message)
      }
    },

    async allUsers(root, args, { user }) {
      try {
        if (!user) throw new Error('You are not authenticated!')
        return models.User.findAll()
      } catch (error) {
        throw new Error(error.message)
      }
    },

    async getPosts(root, args, { user }) {
      console.log(user)
      try {
        if (!user) throw new Error('You are not authenticated!')
        return await models.Post.findAll()
      } catch (e) {
        throw new Error('Fetch posts is not available')
      }
    },

    async getPost(root, { id }, { user }) {
      try {
        if (!user) throw new Error('You are not authenticated!');
        return await models.Post.findByPk(id);
      } catch (e) {
        throw new Error('Fetch post is not available')
      }
    }
  },

  Mutation: {
    async registerUser(root, { username, email, password }) {
      try {
        const user = await models.User.create({
          username,
          email,
          password: await bcrypt.hash(password, 10)
        });

        const token = jsonwebtoken.sign(
          { id: user.id, email: user.email},
          process.env.JWT_SECRET,
          { expiresIn: '1y' }
        );

        return {
          token, id: user.id, username: user.username, email: user.email, message: "Authentication successfully"
        }
      } catch (error) {
        throw new Error(error.message)
      }
    },

    async login(_, { email, password }) {
      try {
        const user = await models.User.findOne({ where: { email }});

        if (!user) {
          throw new Error('No user with that email')
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          throw new Error('Incorrect password')
        }

        const token = jsonwebtoken.sign(
          { id: user.id, email: user.email},
          process.env.JWT_SECRET,
          { expiresIn: '1d'}
        )

        return { token, user }
      } catch (error) {
        throw new Error(error.message)
      }
    },

    async createPost(root, { post }) {
      const { title, content } = post;

      try {
        return await models.Post.create({
          title, content
        })
      } catch (e) {
        throw new Error('Title is required')
      }
    },

    async updatePost(root, { id }) {
      try {
        const post = await models.Post.findByPk(id)
        // list.done = true
        await post.save()
        return post
      } catch (e) {
        throw new Error('Id is required')
      }
    },

    async deletePost(root, { id }) {
      try {
        const posts = await models.Post.findAll({
          where: {id}
        })
        await posts[0].destroy()
        return true
      } catch (e) {
        throw new Error('Id is required')
        return false
      }
    }
  }
}

module.exports = index
