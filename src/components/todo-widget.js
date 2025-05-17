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
    _pendingSync: { type: Array, state: true },     // List of sync actions to send to server
    _showLoginAlert: { type: Boolean, state: true } // Show login required alert 
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
    
    .login-alert {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 59, 48, 0.9);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      animation: fadeInOut 3s ease-in-out;
    }
  `;

  constructor() {
    super();
    this.tasks = [];
    this.newTask = '';
    this._error = '';
    this._loading = false;
    this._pendingSync = [];
    this._showLoginAlert = false;
    this._loadInitialState();
  }

   // Load tasks and pending sync actions
  _loadInitialState() {
    const savedTasks = localStorage.getItem('todoList');
    const pendingSync = localStorage.getItem('pendingTodoSync');
    
    if (savedTasks) {
      try {
        this.tasks = JSON.parse(savedTasks);
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
      }
    }
    
    if (pendingSync) {
      try {
        this._pendingSync = JSON.parse(pendingSync);
      } catch (e) {
        console.error('Failed to parse pending sync', e);
      }
    }
  }

  // Save current tasks
  _saveState() {
    localStorage.setItem('todoList', JSON.stringify(this.tasks));
    localStorage.setItem('pendingTodoSync', JSON.stringify(this._pendingSync));
  }

  // Show alert when user not logged in 
  _showLoginMessage() {
    this._showLoginAlert = true;
    console.log("showLoginMessage triggered");
    setTimeout(() => {
      this._showLoginAlert = false;
      this.requestUpdate('_showLoginAlert');
    }, 3000);
  }

  // Load tasks from server & localStorage + merge them
  async loadTasks() {
    this._loading = true;
    try {
      const user = getUser();
      if (user?.token) {
        const response = await fetch(`${BASE_URL}/tasks?start=1&count=100`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const serverTasks = data.tasks || [];
          
          // Preserve checked state
          const localTasks = this.tasks.filter(t => !t.serverData);
          this.tasks = [
            ...serverTasks.map(st => {
              const existing = this.tasks.find(t => t.id === st.id);
              return {
                id: st.id,
                title: st.summary,
                checked: existing ? existing.checked : false,
                serverData: true
              };
            }),
            ...localTasks
          ];
        }
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      this._error = 'Failed to sync with server. Using local tasks.';
    } finally {
      this._loading = false;
      this._saveState();
    }
  }

  // Sync changes (add/delete) with server
  async syncWithServer() {
    const user = getUser();
    if (!user?.token) return;

    this._loading = true;
    try {
      const additions = this._pendingSync.filter(item => item.action === 'add');
      for (const item of additions) {
        // POST new task to server
        const response = await fetch(`${BASE_URL}/tasks`, {
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
        
        if (response.ok) {
          const data = await response.json();
          this.tasks = this.tasks.map(t => 
            t === item.task ? { ...t, id: data.id, serverData: true } : t
          );
          this._pendingSync = this._pendingSync.filter(i => i !== item);
        }
      }

      const deletions = this._pendingSync.filter(item => item.action === 'delete');
      for (const item of deletions) {
        // DELETE task from server
        await fetch(`${BASE_URL}/tasks/${item.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        this._pendingSync = this._pendingSync.filter(i => i !== item);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this._loading = false;
      this._saveState();
    }
  }

  // Handle input box change
  handleInput(e) {
    this.newTask = e.target.value;
  }

  // Add task
  async addTask(e) {
    e.preventDefault();
    const user = getUser();
    if (!user?.token) {
      this._showLoginMessage();
      return;
    }

    const text = this.newTask.trim();
    if (!text) return;

    const newTask = { 
      title: text,
      checked: false,
      id: null,
      serverData: false
    };
    
    this.tasks = [...this.tasks, newTask];
    this._pendingSync = [...this._pendingSync, { action: 'add', task: newTask }];
    this.newTask = '';
    
    this._saveState();
    await this.syncWithServer();  // Try syncing after adding
  }

  // Delete task
  async deleteTask(taskId, index, e) {
    e.stopPropagation();
    const user = getUser();
    if (!user?.token) {
      this._showLoginMessage();
      return;
    }

    this.tasks = this.tasks.filter((_, i) => i !== index);
    if (taskId) {
      this._pendingSync = [...this._pendingSync, { action: 'delete', id: taskId }];
    }
    
    this._saveState();
    await this.syncWithServer();
  }

  // Toggle task completion
  toggleChecked(index) {
    this.tasks[index].checked = !this.tasks[index].checked;
    this._saveState();
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadTasks();
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
        <button type="submit" ?disabled=${this._loading}>Add</button>
      </form>

      ${this._loading ? html`<div>Loading tasks...</div>` : ''}
      ${this._error ? html`<div class="error">${this._error}</div>` : ''}
      ${this._showLoginAlert ? html`<div class="login-alert">Please login to modify tasks</div>` : ''}

      <ul>
        ${this.tasks.map((task, index) => html`
          <li class=${task.checked ? 'done' : ''}>
            <div class="item-content" @click=${() => this.toggleChecked(index)}>
              <input
                type="checkbox"
                .checked=${task.checked}
                ?disabled=${this._loading}
              />
              <span class="task-title">${task.title}</span>
            </div>
            <button 
              @click=${(e) => this.deleteTask(task.id, index, e)} 
              class="btn-picto"
              ?disabled=${this._loading}
            >🗑️</button>
          </li>
        `)}
      </ul>
    `;
  }
}

customElements.define('todo-widget', TodoWidget);