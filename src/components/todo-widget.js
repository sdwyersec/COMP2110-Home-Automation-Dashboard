// Import
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { BASE_URL } from '../config.js';
import { getUser } from '../auth.js';

export class TodoWidget extends LitElement {
  // Declare properties
  static properties = {
    tasks: { type: Array, state: true },            // List of tasks
    newTask: { type: String },                      // Text for new task
    _error: { type: String, state: true },          // Error message display
    _loading: { type: Boolean, state: true },       // Loading state flag
    _pendingSync: { type: Array, state: true }      // List of sync actions to send to server
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
    this._error = '';
    this._loading = false;
    this._pendingSync = this._loadFromStorage('pendingTodoSync', []);
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadTasks();
  }

  // Load & parse localStorage item
  _loadFromStorage(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
      return fallback;
    }
  }

  // Save value to localStorage
  _saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Load tasks from server & localStorage + merge them
  async loadTasks() {
    this._loading = true;
    this._error = '';
    let serverTasks = [];

    try {
      const user = getUser();
      if (user?.token) {
        const res = await fetch(`${BASE_URL}/tasks?start=1&count=100`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          serverTasks = data.tasks || [];
        }
      }

      // Load tasks
      const localTasks = this._loadFromStorage('todoList', []);
      const deletions = new Set(this._pendingSync.filter(i => i.action === 'delete').map(i => i.id));
      const additions = this._pendingSync.filter(i => i.action === 'add').map(i => i.task);

      // Filter out deleted server tasks
      const filteredServer = serverTasks.filter(t => !deletions.has(t.id)).map(t => ({
        id: t.id, title: t.summary, checked: false, serverData: true
      }));

      const merged = [...filteredServer, ...additions];
      const final = [
        ...merged,
        ...localTasks.filter(l => !merged.some(t => t.id === l.id) && !deletions.has(l.id))
      ];

      this.tasks = final;
      this._saveToStorage('todoList', final);
    } catch (err) {
      // Fallback 2 local data if server fetch fails
      console.error(err);
      this._error = 'Failed to load from server. Using local tasks.';
      this.tasks = this._loadFromStorage('todoList', []);
    } finally {
      this._loading = false;
    }
  }

  // Sync changes (add/delete) with server
  async syncWithServer() {
    const user = getUser();
    if (!user?.token || !this._pendingSync.length) return;

    this._loading = true;
    const pending = [...this._pendingSync];

    for (const item of pending) {
      try {
        if (item.action === 'add' && !item.task.id) {
          // POST new task to server
          const res = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
              summary: item.task.title,
              text: '',
              priority: 1,
              category: 'ToDo',
              due: new Date().toISOString()
            })
          });
          if (res.ok) {
            const { id } = await res.json();
            this.tasks = this.tasks.map(t => t === item.task ? { ...t, id, serverData: true } : t);
            this._pendingSync = this._pendingSync.filter(i => i !== item);
          }
        } else if (item.action === 'delete' && item.id) {
          // DELETE task from server
          await fetch(`${BASE_URL}/tasks/${item.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          this._pendingSync = this._pendingSync.filter(i => i !== item);
        }
      } catch (err) {
        console.error('Sync error:', err);
      }
    }

    this._saveToStorage('pendingTodoSync', this._pendingSync);
    this._saveToStorage('todoList', this.tasks);
    this._loading = false;
  }

  // Handle input box change
  handleInput = e => this.newTask = e.target.value;

  // Add task
  async addTask(e) {
    e.preventDefault();
    const text = this.newTask.trim();
    if (!text) return;

    const task = { title: text, checked: false, id: null, serverData: false };
    this.tasks = [...this.tasks, task];
    this._pendingSync = [...this._pendingSync, { action: 'add', task }];
    this.newTask = '';

    this._saveToStorage('todoList', this.tasks);
    this._saveToStorage('pendingTodoSync', this._pendingSync);

    await this.syncWithServer();  // Try syncing after adding
  }

  // Delete task
  async deleteTask(id, index, e) {
    e.stopPropagation();
    if (id) this._pendingSync.push({ action: 'delete', id });
    this.tasks.splice(index, 1);
    this.requestUpdate();

    this._saveToStorage('todoList', this.tasks);
    this._saveToStorage('pendingTodoSync', this._pendingSync);

    await this.syncWithServer();
  }

  // Toggle task completion
  toggleChecked(index) {
    this.tasks[index].checked = !this.tasks[index].checked;
    this.requestUpdate();
    this._saveToStorage('todoList', this.tasks);
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
          ?disabled=${this._loading}
        />
        <button ?disabled=${this._loading}>Add</button>
      </form>

      ${this._loading ? html`<div>Loading tasks...</div>` : ''}
      ${this._error ? html`<div class="error">${this._error}</div>` : ''}

      <ul>
        ${this.tasks.map((task, index) => html`
          <li class=${task.checked ? 'done' : ''}>
            <div class="item-content" @click=${() => this.toggleChecked(index)}>
              <input type="checkbox" .checked=${task.checked} ?disabled=${this._loading} />
              <span class="task-title">${task.title}</span>
            </div>
            <button
              class="btn-picto"
              @click=${e => this.deleteTask(task.id, index, e)}
              ?disabled=${this._loading}
            >🗑️</button>
          </li>
        `)}
      </ul>
    `;
  }
}

customElements.define('todo-widget', TodoWidget);