const models = require('../models');

module.exports = {
  Query: {
    async getPosts(root, args, { user }) {
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