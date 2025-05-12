// Import
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { BASE_URL } from './config.js';
import { getUser } from './auth.js';

// Define custom element
export class ShoppingListWidget extends LitElement {
  // Declare reactive properties
  static properties = {
    items: { type: Array, state: true },  // List of shopping items
    newItem: { type: String },  // Input field for new item
    _hasInitialLoad: { type: Boolean, state: true } // Flag to avoid reloading on multiple connections
  };

  // Style
  static styles = css`
    :host {
  display: block;
  padding: 1rem;
  background: rgba(177, 177, 224, 0.2);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

    .label {
      flex: 1;
      cursor: pointer;
      color: #fff;
      overflow-wrap: anywhere;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .quantity {
      min-width: 1.5rem;
      text-align: center;
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

    .error {
      color: #ff6b6b;
      text-align: center;
      margin: 1rem 0;
    }
  `;

  // Initialise properties
  constructor() {
    super();
    this.items = [];  // Start with empty list
    this.newItem = '';   // Start with empty input field
    this._hasInitialLoad = false;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this._hasInitialLoad) {
      this.loadItems();
      this._hasInitialLoad = true;
    }
  }

  // Load items from API
  async loadItems() {
    try {
      const user = getUser();
      let loadedItems = [];

      if (user?.token) {
        const response = await fetch(`${BASE_URL}/lists`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const items = Array.isArray(data.items) ? data.items : data;
          if (Array.isArray(items)) {
            loadedItems = items;
          }
        }
      }

      // Fallback to localStorage if API fetch fails
      if (!loadedItems.length) {
        const localItems = localStorage.getItem('shoppingList');
        loadedItems = localItems ? JSON.parse(localItems) : [];
      }

      // Validate item & filter out invalid ones
      const validItems = loadedItems.filter(item =>
        item &&
        typeof item.name === 'string' &&
        item.name.trim().length > 0
      );

      this.items = validItems;
    } catch (error) {
      console.error('Error loading items:', error);
    }
  }

  // Save current list to API
  async saveItems() {
    try {
      localStorage.setItem('shoppingList', JSON.stringify(this.items));

      const user = getUser();
      if (user?.token) {
        await fetch(`${BASE_URL}/lists`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ items: this.items })
        });
      }
    } catch (error) {
      console.error('Error saving items:', error);
    }
  }

  // Handle input changes in text field
  handleInput(e) {
    this.newItem = e.target.value;
  }

  // Add a new item
  async addItem(e) {
    e.preventDefault();
    const text = this.newItem.trim();
    if (!text) return;

    const newItem = { name: text, quantity: 1, checked: false };
    this.items = [...this.items, newItem];
    this.newItem = '';
    await this.saveItems();
  }

  // Delete item by index
  async deleteItem(index, e) {
    e.stopPropagation();
    this.items = this.items.filter((_, i) => i !== index);
    await this.saveItems();
  }

  // Toggle checkbox
  async toggleChecked(index) {
    this.items = this.items.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    );
    await this.saveItems();
  }

  // Increase quantity
  async increaseQuantity(index, e) {
    e.stopPropagation();
    this.items = this.items.map((item, i) =>
      i === index ? { ...item, quantity: item.quantity + 1 } : item
    );
    await this.saveItems();
  }

  // Decrease quantity
  async decreaseQuantity(index, e) {
    e.stopPropagation();
    this.items = this.items.map((item, i) =>
      i === index && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    await this.saveItems();
  }

  // HTML structure for widget
  render() {
    return html`
      <h3>Shopping List</h3>

      <!-- Form for adding new items -->
      <form @submit=${this.addItem}>
        <input
          type="text"
          placeholder="Add item"
          .value=${this.newItem}
          @input=${this.handleInput}
        />
        <button type="submit">Add</button>
      </form>


      <!-- Render the list of items -->
      <ul>
        ${this.items.map((item, index) => html`
          <li class=${item.checked ? 'done' : ''}>
            <span class="label" @click=${() => this.toggleChecked(index)}>
              ${item.name}
            </span>
            <div class="actions">
              <button @click=${(e) => this.decreaseQuantity(index, e)}>-</button>
              <span class="quantity">${item.quantity}</span>
              <button @click=${(e) => this.increaseQuantity(index, e)}>+</button>
              <input
                type="checkbox"
                .checked=${item.checked}
                @change=${() => this.toggleChecked(index)}
              />
              <button @click=${(e) => this.deleteItem(index, e)} class="btn-picto">🗑️</button>
            </div>
          </li>
        `)}
      </ul>
    `;
  }
}

// Register custom element so it can be used in HTML as <shopping-list-widget>
customElements.define('shopping-list-widget', ShoppingListWidget);
