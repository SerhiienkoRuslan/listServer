new Vue({
  el: '#app',
  data() {
    return {
      isDark: true,
      show: true,
      listTitle: '',
      lists: []
    }
  },
  created() {
    const query = `
      query {
        getLists {
          id title createdAt updatedAt
        }
      }
    `

    fetch('/graphql', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query })
    })
      .then(res => res.json())
      .then(response => {
        this.todos = response.data.getLists
      })
  },
  methods: {
    addList() {
      const title = this.listTitle.trim()
      if (!title) {
        return
      }
      const query = `
        mutation {
          createList(list: {title: "${title}"}) {
            id title createdAt updatedAt
          }
        }
      `
      fetch('/graphql', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({query})
      })
        .then(res => res.json())
        .then(response => {
          const todo = response.data.createList
          this.lists.push(todo)
          this.listTitle = ''
        })
        .catch(e => console.log(e))
    },
    removeList(id) {
      const query = `
        mutation {
          deleteList(id: "${id}")
        }
      `
      fetch('/graphql', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ query })
      })
        .then(() => {
          this.lists = this.lists.filter(t => t.id !== id)
        })
        .catch(e => console.log(e)) 
    },
    updateList(id) {
      const query = `
        mutation {
          updateList(id: "${id}") {
            updatedAt
          }
        }
      `

      fetch('/graphql', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ query })
      })
        .then(res => res.json())
        .then(response => {
          const idx = this.lists.findIndex(t => t.id === id)
          this.lists[idx].updatedAt = response.data.updateList.updatedAt
        })
        .catch(e => console.log(e))
    }
  },
  filters: {
    capitalize(value) {
      return value.toString().charAt(0).toUpperCase() + value.slice(1)
    },
    date(value, withTime) {
      const options = {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
      }

      if (withTime) {
        options.hour = '2-digit'
        options.minute = '2-digit'
        options.second = '2-digit'
      }
      return new Intl.DateTimeFormat('ru-RU', options).format(new Date(+value))
    }
  }
})