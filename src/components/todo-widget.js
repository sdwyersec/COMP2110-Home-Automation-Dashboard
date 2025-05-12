class TodoWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.tasks = [];
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const style = `
      :host {
        display: block;
        background: rgba(255, 255, 255, 0.85);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 16px;
        max-width: 320px;
        font-family: Arial, sans-serif;
      }
      h2 {
        margin: 0 0 12px;
        font-size: 1.4rem;
        color: #333;
      }
      ul {
        list-style: none;
        padding: 0;
        margin: 0 0 12px;
        max-height: 200px;
        overflow-y: auto;
      }
      li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        border-bottom: 1px solid #ddd;
      }
      li:last-child {
        border-bottom: none;
      }
      button.remove {
        background: none;
        border: none;
        color: #e74c3c;
        font-size: 1.2rem;
        cursor: pointer;
      }
      input.new-task {
        width: calc(100% - 2px);
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        margin-bottom: 8px;
        box-sizing: border-box;
      }
      button.add {
        width: 100%;
        padding: 10px;
        border: none;
        background: #3498db;
        color: white;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
      }
      button.add:hover {
        background: #2980b9;
      }
    `;

    this.shadowRoot.innerHTML = `
      <style>${style}</style>
      <h2>To-Do List</h2>
      <ul id="task-list">
        ${this.tasks.map((task, i) => `<li>${task}<button class="remove" data-index="${i}">&times;</button></li>`).join('')}
      </ul>
      <input class="new-task" type="text" placeholder="Add a new task..." />
      <button class="add">Add Task</button>
    `;

    this.shadowRoot.querySelector('.add').addEventListener('click', () => this._addTask());
    this.shadowRoot.querySelector('.new-task').addEventListener('keydown', e => {
      if (e.key === 'Enter') this._addTask();
    });
    this.shadowRoot.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', e => this._removeTask(e.target.dataset.index));
    });
  }

  _addTask() {
    const input = this.shadowRoot.querySelector('.new-task');
    const value = input.value.trim();
    if (!value) return;
    this.tasks = [...this.tasks, value];
    input.value = '';
    this.render();
  }

  _removeTask(index) {
    this.tasks = this.tasks.filter((_, i) => i != index);
    this.render();
  }
}

customElements.define('todo-widget', TodoWidget);
