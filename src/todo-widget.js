// Import
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { BASE_URL } from './config.js';
import { getUser } from './auth.js';

// Define custom element
export class TodoWidget extends LitElement {
  // Declare reactive properties
  static properties = {
    tasks: { type: Array, state: true },  // List of tasks
    newTask: { type: String },            // Input field for new task
    _hasInitialLoad: { type: Boolean, state: true } // Flag to avoid reloading on multiple connections
  };

  // Styles for the widget (distinct from shopping list)
  static styles = css`
    :host {
      display: block;
      border: 1px solid #ddd;
      padding: 1rem;
      border-radius: 8px;
      background: #f9f9f9;
      font-family: Arial, sans-serif;
    }

    h3 {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
      color: #333;
    }

    form {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    input[type="text"] {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
    }

    button[type="submit"] {
      padding: 0.5rem 1rem;
      border: none;
      background: #28a745;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    button[type="submit"]:hover {
      background: #218838;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .task-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;
    }

    .item-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .task-title {
      font-size: 1rem;
      color: #555;
    }

    .completed {
      text-decoration: line-through;
      color: #999;
    }

    .btn-picto {
      font-size: 1.2rem;
      background: none;
      border: none;
      cursor: pointer;
      color: #dc3545;
    }

    .btn-picto:hover {
      color: #bd2130;
    }
  `;

  constructor() {
    super();
    this.tasks = [];
    this.newTask = '';
    this._hasInitialLoad = false;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this._hasInitialLoad) {
      this.loadTasks();
      this._hasInitialLoad = true;
    }
  }

  // Load tasks from API or localStorage
  async loadTasks() {
    try {
      const user = getUser();
      let loadedTasks = [];

      if (user?.token) {
        const response = await fetch(`${BASE_URL}/tasks`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          loadedTasks = Array.isArray(data.tasks) ? data.tasks : data;
        }
      }

      // Fallback to localStorage
      if (!loadedTasks.length) {
        const localData = localStorage.getItem('todoList');
        loadedTasks = localData ? JSON.parse(localData) : [];
      }

      // Validate and set tasks
      this.tasks = loadedTasks.filter(task =>
        task && typeof task.title === 'string' && task.title.trim().length
      );
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  // Save tasks to API and localStorage
  async saveTasks() {
    try {
      localStorage.setItem('todoList', JSON.stringify(this.tasks));
      const user = getUser();
      if (user?.token) {
        await fetch(`${BASE_URL}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ tasks: this.tasks })
        });
      }
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }

  handleInput(e) {
    this.newTask = e.target.value;
  }

  // Add a new task
  async addTask(e) {
    e.preventDefault();
    const text = this.newTask.trim();
    if (!text) return;

    const newTask = { title: text, checked: false };
    this.tasks = [...this.tasks, newTask];
    this.newTask = '';
    await this.saveTasks();
  }

  // Delete task by index
  async deleteTask(index, e) {
    e.stopPropagation();
    this.tasks = this.tasks.filter((_, i) => i !== index);
    await this.saveTasks();
  }

  // Toggle task completion
  async toggleChecked(index) {
    this.tasks = this.tasks.map((task, i) =>
      i === index ? { ...task, checked: !task.checked } : task
    );
    await this.saveTasks();
  }

  render() {
    return html`
      <h3>To Do List</h3>
      <form @submit=${this.addTask}>
        <input
          type="text"
          placeholder="Add task"
          .value=${this.newTask}
          @input=${this.handleInput}
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        ${this.tasks.map((task, index) => html`
          <li class="task-item">
            <div class="item-content" @click=${() => this.toggleChecked(index)}>
              <input
                type="checkbox"
                .checked=${task.checked}
              />
              <span class="task-title ${task.checked ? 'completed' : ''}">${task.title}</span>
            </div>
            <button @click=${(e) => this.deleteTask(index, e)} class="btn-picto">🗑️</button>
          </li>
        `)}
      </ul>
    `;
  }
}

// Register custom element so it can be used as <todo-widget>
customElements.define('todo-widget', TodoWidget);
