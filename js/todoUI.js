export class TodoUI {
  constructor(todoList, statistics, themeManager) {
    this.todoList = todoList;
    this.storage = todoList.storage;
    this.statistics = statistics;
    this.themeManager = themeManager;
    this.currentFilter = 'all';
    this.currentQuickFilter = '';
    this.searchQuery = '';
    this.sortBy = 'deadline';
    this.editingTodoId = null;
    setInterval(() => {
      this.todoList.todos.forEach(todo => {
        if (!todo.completed && !todo.deleted && new Date(todo.deadline) < new Date()) {
          this.showAlert(`Task "${todo.text}" is overdue!`, 'overdue');
        }
      });
    }, 60000);
  }

  initialize() {
    // Initialize elements
    this.addTaskDialog = document.getElementById('add-task-dialog');
    this.editTaskDialog = document.getElementById('edit-task-dialog');
    this.form = document.getElementById('todo-form');
    this.editForm = document.getElementById('edit-todo-form');
    this.input = document.getElementById('todo-input');
    this.editInput = document.getElementById('edit-todo-input');
    this.description = document.getElementById('todo-description');
    this.editDescription = document.getElementById('edit-todo-description');
    this.deadline = document.getElementById('todo-deadline');
    this.editDeadline = document.getElementById('edit-todo-deadline');
    this.priority = document.getElementById('todo-priority');
    this.editPriority = document.getElementById('edit-todo-priority');
    this.tag = document.getElementById('todo-tag');
    this.editTag = document.getElementById('edit-todo-tag');
    this.todoListElement = document.getElementById('todo-list');
    this.searchInput = document.getElementById('search-input');
    this.sortSelect = document.getElementById('sort-select');
    this.viewTitle = document.getElementById('view-title');
    this.tasksContainer = document.getElementById('tasks-container');
    this.statisticsView = document.getElementById('statistics-view');
    this.emptyState = document.getElementById('empty-state');

    // Add event listeners
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.editForm.addEventListener('submit', (e) => this.handleEditSubmit(e));
    this.searchInput.addEventListener('input', () => this.handleSearch());
    this.sortSelect.addEventListener('change', () => this.handleSort());
    
    document.getElementById('add-task-btn').addEventListener('click', () => {
      this.addTaskDialog.showModal();
    });

    document.getElementById('cancel-add').addEventListener('click', () => {
      this.addTaskDialog.close();
    });

    document.getElementById('cancel-edit').addEventListener('click', () => {
      this.editTaskDialog.close();
    });

    // Navigation event listeners
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        if (view === 'statistics') {
          this.showStatistics();
        } else {
          this.setFilter(item.dataset.filter);
        }
      });
    });

    document.querySelectorAll('.quick-filter').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.setQuickFilter(item.dataset.quickFilter);
      });
    });

    this.render();
    // this.updateStatsView()
    this.checkOverdueTasks();
    setInterval(() => this.checkOverdueTasks(), 60000);
    setInterval(() => this.showOverdueNotification(), 60000);
  }

  handleSubmit(e) {
    e.preventDefault();
    const text = this.input.value.trim();
    const description = this.description.value.trim();
    const deadline = this.deadline.value;
    const priority = this.priority.value;
    const tag = this.tag.value;
    
    if (text) {
      this.todoList.addTodo(text, description, deadline, priority, tag);
      this.input.value = '';
      this.description.value = '';
      this.deadline.value = '';
      this.priority.value = 'low';
      this.tag.value = 'work';
      this.addTaskDialog.close();
      this.render();
    }
  }

  handleEditSubmit(e) {
    e.preventDefault();
    const text = this.editInput.value.trim();
    const description = this.editDescription.value.trim();
    const deadline = this.editDeadline.value;
    const priority = this.editPriority.value;
    const tag = this.editTag.value;
    
    if (text && this.editingTodoId) {
      // Find the existing todo
      const existingTodo = this.todoList.todos.find(todo => todo.id === this.editingTodoId);
      if (existingTodo) {
        // Update the existing todo
        existingTodo.text = text;
        existingTodo.description = description;
        existingTodo.deadline = deadline;
        existingTodo.priority = priority;
        existingTodo.tag = tag;
        // Save the changes
        this.storage.saveTodos(this.todoList.todos);
      }
      this.editTaskDialog.close();
      this.editingTodoId = null;
      this.render();
    }
  }

  handleSearch() {
    this.searchQuery = this.searchInput.value;
    this.render();
  }

  handleSort() {
    this.sortBy = this.sortSelect.value;
    this.render();
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.currentQuickFilter = '';
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.filter === filter);
    });
    this.showTasks();
  }

  setQuickFilter(quickFilter) {
    this.currentQuickFilter = quickFilter;
    this.render();
  }

  showStatistics() {
    this.tasksContainer.style.display = 'none';
    this.statisticsView.classList.remove('hidden');
    this.viewTitle.textContent = 'Statistics';
    
    const stats = this.statistics.getStats();
    document.getElementById('total-tasks').textContent = stats.total;
    document.getElementById('completed-tasks').textContent = stats.completed;
    document.getElementById('active-tasks').textContent = stats.active;
    document.getElementById('overdue-tasks').textContent = stats.overdue;
  }

  showTasks() {
    this.tasksContainer.style.display = 'block';
    this.statisticsView.classList.add('hidden');
    this.viewTitle.textContent = this.getViewTitle();
    this.render();
  }

  getViewTitle() {
    if (this.currentQuickFilter) {
      return this.currentQuickFilter === 'today' ? "Today's Tasks" : "This Week's Tasks";
    }
    switch (this.currentFilter) {
      case 'active': return 'Active Tasks';
      case 'completed': return 'Completed Tasks';
      case 'deleted': return 'Recently Deleted';
      default: return 'All Tasks';
    }
  }

  render() {
    let todos = this.todoList.getTodos(this.currentFilter, this.searchQuery, this.currentQuickFilter);
    todos = this.todoList.sortTodos(todos, this.sortBy);

    if (todos.length === 0) {
      this.todoListElement.style.display = 'none';
      this.emptyState.style.display = 'block';
    } else {
      this.todoListElement.style.display = 'block';
      this.emptyState.style.display = 'none';
      this.todoListElement.innerHTML = todos.map(todo => this.createTodoElement(todo)).join('');

      // Add event listeners to todo items
      todos.forEach(todo => {
        const element = document.getElementById(`todo-${todo.id}`);
        if (element) {
          element.querySelector('.todo-checkbox').addEventListener('change', () => {
            this.todoList.toggleTodo(todo.id);
            this.render();
          });

          if (todo.deleted) {
            const restoreBtn = element.querySelector('.todo-restore-btn');
            restoreBtn.addEventListener('click', () => {
              this.todoList.restoreTodo(todo.id);
              this.render();
            });

            const permanentDeleteBtn = element.querySelector('.todo-permanent-delete-btn');
            permanentDeleteBtn.addEventListener('click', () => {
              if (confirm('Are you sure you want to permanently delete this task? This action cannot be undone.')) {
                this.todoList.permanentDelete(todo.id);
                this.render();
              }
            });
          } else {
            const editBtn = element.querySelector('.todo-edit-btn');
            editBtn.addEventListener('click', () => {
              this.editingTodoId = todo.id;
              this.editInput.value = todo.text;
              this.editDescription.value = todo.description;
              this.editDeadline.value = todo.deadline;
              this.editPriority.value = todo.priority;
              this.editTag.value = todo.tag;
              this.editTaskDialog.showModal();
            });

            const deleteBtn = element.querySelector('.todo-action-btn');
            deleteBtn.addEventListener('click', () => {
              this.todoList.deleteTodo(todo.id);
              this.render();
            });
          }
        }
      });
    }
  }

  createTodoElement(todo) {
    const deadline = todo.deadline ? new Date(todo.deadline).toLocaleString() : 'No deadline';
    const classes = ['todo-item'];
    if (todo.completed) classes.push('completed');
    if (todo.deleted) classes.push('deleted');

    const isOverdue = !todo.completed && !todo.deleted && new Date(todo.deadline) < new Date();
    if (isOverdue) classes.push('overdue');

    const priorityColors = {
      high: 'var(--priority-high)',
      medium: 'var(--priority-medium)',
      low: 'var(--priority-low)'
    };

    return `
      <li id="todo-${todo.id}" class="${classes.join(' ')}">
        <input 
          type="checkbox" 
          class="todo-checkbox" 
          ${todo.completed ? 'checked' : ''}
          ${todo.deleted ? 'disabled' : ''}
        >
        <div class="todo-content">
          <div class="todo-header">
            <div class="todo-text">${todo.text}</div>
            <div class="todo-meta">
              <span class="todo-status ${todo.completed ? 'completed' : 'pending'}">
                ${todo.completed ? 'Completed' : 'Pending'}
              </span>
              <span class="todo-priority" style="background-color: ${priorityColors[todo.priority]}">${todo.priority}</span>
              <span class="todo-tag">${todo.tag}</span>
            </div>
          </div>
          <div class="todo-description">Description: ${todo.description}</div>
          ${this.getTimeRemaining(todo.deadline).isOverdue
              ? `<div class="todo-countdown">Overdue!</div>`
              : `<div class="todo-countdown">Time Remaining: ${this.getTimeRemaining(todo.deadline).days}d ${this.getTimeRemaining(todo.deadline).hours}h ${this.getTimeRemaining(todo.deadline).minutes}m ${this.getTimeRemaining(todo.deadline).seconds}s</div>`}
          <div class="todo-deadline">Deadline: ${deadline}</div>
        </div>
        <div class="todo-actions">
          ${todo.deleted ? `
            <button class="todo-restore-btn">Restore</button>
            <button class="todo-permanent-delete-btn">Delete Permanently</button>
          ` : `
            <button class="todo-edit-btn">Edit</button>
            <button class="todo-action-btn">Delete</button>
          `}
        </div>
      </li>
    `;
  }

  checkOverdueTasks() {
    const todos = this.todoList.todos;
    const now = new Date();

    todos.forEach(todo => {
      if (!todo.completed && !todo.deleted && todo.deadline) {
        const deadline = new Date(todo.deadline);
        if (deadline < now) {
          this.showAlert(`Task "${todo.text}" is overdue!`, 'overdue');
        }
      }
    });
  }

  showAlert(message, type = 'overdue') {
    const alertContainer = document.getElementById('alert-container');
    const alertBox = document.createElement('div');
    alertBox.classList.add('alert-box', type);
    
    const alertContent = document.createElement('div');
    alertContent.classList.add('alert-content');
    
    const alertIcon = document.createElement('span');
    alertIcon.classList.add('alert-icon');
    alertIcon.textContent = type === 'overdue' ? '⚠️' : '✅';
    
    const alertMessage = document.createElement('div');
    alertMessage.classList.add('alert-message');
    alertMessage.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.classList.add('close-btn');
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      alertBox.classList.add('hide');
      setTimeout(() => alertBox.remove(), 300);
    });
    
    alertContent.appendChild(alertIcon);
    alertContent.appendChild(alertMessage);
    alertBox.appendChild(alertContent);
    alertBox.appendChild(closeButton);
    alertContainer.appendChild(alertBox);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (alertBox.parentNode) {
        alertBox.classList.add('hide');
        setTimeout(() => alertBox.remove(), 300);
      }
    }, 5000);
  }

  showOverdueNotification() {
    this.todoList.todos.forEach(todo => {
      if (!todo.completed && !todo.deleted && new Date(todo.deadline) < new Date() && !todo.notified) {
        this.showAlert(`Task "${todo.text}" is overdue!`, 'overdue');
        todo.notified = true;
        this.storage.saveTodos(this.todoList.todos);
      }
    });
  }

  getTimeRemaining(deadline) {
    let total = Date.parse(deadline) - Date.parse(new Date());
    let isOverdue = false;

    if (total < 0) {
      total = Math.abs(total);
      isOverdue = true;
    }

    const seconds = Math.floor((Math.abs(total) / 1000) % 60);
    const minutes = Math.floor((Math.abs(total) / 1000 / 60) % 60);
    const hours = Math.floor((Math.abs(total) / (1000 * 60 * 60)) % 24);
    const days = Math.floor(Math.abs(total) / (1000 * 60 * 60 * 24));

    return {
      total,
      days,
      hours,
      minutes,
      seconds,
      isOverdue
    };
  }
}