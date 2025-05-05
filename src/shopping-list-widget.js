// Import 
import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

// Define custom element
export class ShoppingListWidget extends LitElement {
  // Declare reactive properties
  static properties = {
    items: { type: Array },    // List of shopping items
    newItem: { type: String }  // Input field for new item
  };

  // Initialise properties
  constructor() {
    super();
    this.items = [];    // Start with empty list
    this.newItem = '';  // Start with empty input field
  }

  // Update newItem string as user types
  handleInput(e) {
    this.newItem = e.target.value;
  }

  // Add `newItem` to list if it's not just spaces
  addItem(e) {
    e.preventDefault(); // Prevent form reloading page
    if (this.newItem.trim()) {
      // Add new item w quantity & checked status
      this.items = [...this.items, { name: this.newItem.trim(), quantity: 1, checked: false }];
      this.newItem = ''; // Clear input field
    }
  }

  // Remove item from list based on index
  deleteItem(index) {
    this.items = this.items.filter((_, i) => i !== index);
  }

  // Toggle checked state
  toggleChecked(index) {
    this.items = this.items.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    );
  }

  // Increase quantity
  increaseQuantity(index) {
    this.items = this.items.map((item, i) =>
      i === index ? { ...item, quantity: item.quantity + 1 } : item
    );
  }

  // Decrease quantity (min of 1)
  decreaseQuantity(index) {
    this.items = this.items.map((item, i) =>
      i === index && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
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
