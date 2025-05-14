// Import
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { BASE_URL } from '../config.js';
import { getUser } from '../auth.js';

// Define custom element
export class TodoWidget extends LitElement {
  // Declare reactive properties
  static properties = {
    tasks: { type: Array, state: true },  // List of tasks
    newTask: { type: String },            // Input field for new task
    _hasInitialLoad: { type: Boolean, state: true } // Flag to avoid reloading on multiple connections
  };

  // Style
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
      background: rgba(177, 177, 224, 0.2);
      border-radius: 10px;
      box-shadow: 0 10px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      color: white;
      box-sizing: border-box;
      width: 100%;
      max-width: 500px;
    }

    h3 {
      text-align: center;
      margin-bottom: 1rem;
      color: #ffffff;
      font-size: 25px;
    }

    form {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    input[type="text"] {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      background: rgba(255, 0, 251, 0.2);
      color: white;
      backdrop-filter: blur(5px);
      max-width: 220px;
    }

    input::placeholder {
      color: #ccc;
    }

    button {
      background-color: rgb(60, 61, 105);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    button:hover {
      background-color: #52537e;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      max-height: 250px;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
    }

    ul::-webkit-scrollbar {
      width: 8px;
    }

    ul::-webkit-scrollbar-track {
      background: transparent;
    }

    ul::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }

    ul::-webkit-scrollbar-thumb:hover {
      background-color: rgba(255, 255, 255, 0.5);
    }

    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.05);
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      border-radius: 8px;
      transition: background 0.2s ease;
      overflow-wrap: anywhere;
    }

    li.done {
      opacity: 0.6;
      text-decoration: line-through;
    }

    .item-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      flex: 1;
    }

    .task-title {
      color: #fff;
      overflow-wrap: anywhere;
    }

    input[type="checkbox"] {
      transform: scale(1.2);
      accent-color: rgb(60, 61, 105);
      cursor: pointer;
    }

    .btn-picto {
      font-size: 1.1rem;
      background: none;
      border: none;
      cursor: pointer;
      color: white;
      padding: 0;
    }

    .btn-picto:hover {
      color: red;
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
          <li class=${task.checked ? 'done' : ''}>
            <div class="item-content" @click=${() => this.toggleChecked(index)}>
              <input
                type="checkbox"
                .checked=${task.checked}
              />
              <span class="task-title">${task.title}</span>
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