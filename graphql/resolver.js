const List = require('../models/list')

module.exports = {
  async getLists() {
    try {
      return await List.findAll()
    } catch (e) {
      throw new Error('Fetch lists is not available')
    }
  },
  async createList({list}) {
    try {
      return await List.create({
        title: list.title
      })
    } catch (e) {
      throw new Error('Title is required')
    }
  },
  async updateList({id}) {
    try {
      const list = await List.findByPk(id)
      // list.done = true
      await list.save()
      return list
    } catch (e) {
      throw new Error('Id is required')
    }
  },
  async deleteList({id}) {
    try {
      const lists = await List.findAll({
        where: {id}
      })
      await lists[0].destroy()
      return true
    } catch (e) {
      throw new Error('Id is required')
      return false
    }
  }
}