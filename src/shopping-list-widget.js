// Import 
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

// Define custom element
export class ShoppingListWidget extends LitElement {
  // Widget styles
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      text-align: left;
    }

    h3 {
      margin-top: 0;
    }

    form {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }

    button {
      padding: 10px 16px;
      background-color: #1976d2;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    button:hover {
      background-color: #125aa1;
    }

    ul {
      list-style-type: none;
      padding-left: 0;
    }

    li {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #eee;
    }

    li button {
      background-color: #e53935;
    }

    li button:hover {
      background-color: #c62828;
    }
  `;

  // Declare reactive properties
  static properties = {
    items: { type: Array },    // List shopping items
    newItem: { type: String }  // Input field for new item
  };

  // Initialise properties
  constructor() {
    super();
    this.items = [];    // Start with empty list
    this.newItem = '';  // Start with empty input field
  }

  handleInput(e) {
    this.newItem = e.target.value;
  }

  // Add `newItem` to list if it's not empty spaces
  addItem(e) {
    e.preventDefault(); // Prevent form submission
    if (this.newItem.trim()) {
      this.items = [...this.items, this.newItem.trim()]; // Add item
      this.newItem = ''; // Clear
    }
  }

  // Remove item from list based on index
  deleteItem(index) {
    this.items = this.items.filter((_, i) => i !== index);
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
          <li>
            ${item}
            <button @click="${() => this.deleteItem(index)}">Delete</button>
          </li>
        `)}
      </ul>
    `;
  }
}

// Register custom element so it can be used in HTML as <shopping-list-widget>!!!!!
customElements.define('shopping-list-widget', ShoppingListWidget);
