export class TodoList {
  constructor(storage) {
    this.storage = storage;
    this.todos = this.storage.getTodos();
  }

  addTodo(text, description, deadline, priority, tag) {
    const todo = {
      id: Date.now(),
      text,
      description,
      deadline,
      priority,
      tag,
      completed: false,
      deleted: false,
      createdAt: new Date().toISOString()
    };

    this.todos.push(todo);
    this.storage.saveTodos(this.todos);
    return todo;
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.storage.saveTodos(this.todos);
    }
  }

  deleteTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.deleted = true;
      this.storage.saveTodos(this.todos);
    }
  }

  restoreTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.deleted = false;
      this.storage.saveTodos(this.todos);
    }
  }

  permanentDelete(id) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.storage.saveTodos(this.todos);
  }

  editTodo(id, text, description, deadline, priority, tag) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.text = text;
      todo.description = description;
      todo.deadline = deadline;
      todo.priority = priority;
      todo.tag = tag;
      this.storage.saveTodos(this.todos);
    }
  }

  getTodos(filter = 'all', searchQuery = '', quickFilter = '') {
    let filteredTodos = this.todos.filter(todo => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!todo.text.toLowerCase().includes(query) && 
            !todo.description.toLowerCase().includes(query)) {
          return false;
        }
      }

      switch (filter) {
        case 'active':
          return !todo.completed && !todo.deleted;
        case 'completed':
          return todo.completed && !todo.deleted;
        case 'deleted':
          return todo.deleted;
        default:
          return !todo.deleted;
      }
    });

    if (quickFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() + 7);

      filteredTodos = filteredTodos.filter(todo => {
        const deadline = new Date(todo.deadline);
        switch (quickFilter) {
          case 'today':
            return deadline >= today && deadline < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          case 'week':
            return deadline >= today && deadline <= weekEnd;
          default:
            return true;
        }
      });
    }

    return filteredTodos;
  }

  sortTodos(todos, sortBy) {
    const priorityValues = { high: 3, medium: 2, low: 1 };
    
    return [...todos].sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline);
        case 'created':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return a.text.localeCompare(b.text);
        case 'priority':
          return priorityValues[b.priority] - priorityValues[a.priority];
        case 'tag':
          return a.tag.localeCompare(b.tag);
        default:
          return 0;
      }
    });
  }
}