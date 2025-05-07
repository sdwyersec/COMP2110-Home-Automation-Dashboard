// Import
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

// Define custom element
export class ShoppingListWidget extends LitElement {
  // Declare reactive properties
  static properties = {
    items: { type: Array },   // List of shopping items
    newItem: { type: String } // Input field for new item
  };

  // Style
  static styles = css`
    :host {
      display: block;
      max-width: 400px;
      height: 420px;
      margin: 2rem auto;
      padding: 1rem;
      background: rgba(177, 177, 224, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
      color: #fff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      box-sizing: border-box;
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
      max-width: 220px; /* slightly restrict width */
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
  `;
  
  // Initialise properties
  constructor() {
    super();
    this.items = [];  // Start with empty list
    this.newItem = '';  // Start with empty input field
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadItems();
  }

  // Load items from /lists API
  async loadItems() {
    try {
      const response = await fetch('/lists');
      const data = await response.json();

      // If /lists returns { lists: [...] }, access the inner array
      this.items = Array.isArray(data) ? data : data.lists || [];
    } catch (error) {
      console.error('Failed to fetch shopping list:', error);
    }
  }

  // Save current list to API
  async saveItems() {
    try {
      await fetch('/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.items)
      });
    } catch (error) {
      console.error('Failed to save shopping list:', error);
    }
  }

  handleInput(e) {
    this.newItem = e.target.value;
  }

  // Add a new item
  async addItem(e) {
    e.preventDefault();
    const trimmed = this.newItem.trim();
    if (trimmed) {
      this.items = [
        ...this.items,
        { name: trimmed, quantity: 1, checked: false }
      ];
      this.newItem = '';
      await this.saveItems();
    }
  }

  // Delete item by index
  async deleteItem(index) {
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
  async increaseQuantity(index) {
    this.items = this.items.map((item, i) =>
      i === index ? { ...item, quantity: item.quantity + 1 } : item
    );
    await this.saveItems();
  }

  // Decrease quantity
  async decreaseQuantity(index) {
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
      <form @submit="${this.addItem}">
        <input
          type="text"
          placeholder="Add item"
          .value="${this.newItem}"
          @input="${this.handleInput}"
        />
        <button type="submit">Add</button>
      </form>

      <!-- Render the list of items -->
      <ul>
        ${this.items.map((item, index) => html`
          <li class="${item.checked ? 'done' : ''}">
            <span class="label" @click="${() => this.toggleChecked(index)}">
              ${item.name}
            </span>
            <div class="actions">
              <button @click="${() => this.decreaseQuantity(index)}">-</button>
              <span class="quantity">${item.quantity}</span>
              <button @click="${() => this.increaseQuantity(index)}">+</button>
              <input
                type="checkbox"
                .checked="${item.checked}"
                @change="${() => this.toggleChecked(index)}"
              />
              <button @click="${() => this.deleteItem(index)}" class="btn-picto">🗑️</button>
            </div>
          </li>
        `)}
      </ul>
    `;
  }
}

// Register custom element so it can be used in HTML as <shopping-list-widget>
customElements.define('shopping-list-widget', ShoppingListWidget);
