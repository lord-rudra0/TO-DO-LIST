export class TodoStorage {
  constructor() {
    this.storageKey = 'todos';
  }

  getTodos() {
    const todos = localStorage.getItem(this.storageKey);
    return todos ? JSON.parse(todos) : [];
  }

  saveTodos(todos) {
    localStorage.setItem(this.storageKey, JSON.stringify(todos));
  }
}