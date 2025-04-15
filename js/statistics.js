export class Statistics {
  constructor(todoList) {
    this.todoList = todoList;
  }

  getStats() {
    const todos = this.todoList.todos;
    const now = new Date();

    return {
      total: todos.filter(t => !t.deleted).length,
      completed: todos.filter(t => t.completed && !t.deleted).length,
      active: todos.filter(t => !t.completed && !t.deleted).length,
      overdue: todos.filter(t => {
        const deadline = new Date(t.deadline);
        return !t.completed && !t.deleted && deadline < now;
      }).length
    };
  }
}