import { BASE_URL } from "../config.js";
import { getUser } from "../auth.js";

class ShoppingListWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }); // Create shadow DOM
    this.listId = null;                  // Store shopping list ID
    this.contents = [];                  // Store list items
  }

  connectedCallback() {
    this.renderLoading(); // "Loading..." message (might change this to an animation)
    this.fetchList();      // Fetch shopping list
  }

  // Fetch all lists
  async fetchList() {
    try {
      const response = await fetch(`${BASE_URL}/lists/`);
      if (!response.ok) throw new Error("Failed to fetch lists");
      const lists = await response.json();

      // Find list with title "Shopping List"
      const shoppingList = lists.find(list => list.title === "Shopping List");

      if (shoppingList) {
        this.listId = shoppingList.id;
        this.contents = shoppingList.contents;
        await this.fetchListContents(); // Fetch full content of list
      } else {
        this.renderNoList(); // No shopping list found :(
      }
    } catch (error) {
      console.error("Error fetching shopping list:", error);
      this.renderError("Error loading shopping list."); // Handle error
    }
  }

  // Fetch list content by ID
  async fetchListContents() {
    try {
      const response = await fetch(`${BASE_URL}/lists/${this.listId}`);
      if (!response.ok) throw new Error("Failed to fetch list contents");
      const list = await response.json();
      this.contents = list.contents; // Update contents
      this.render();                 // Re-render widget
    } catch (error) {
      console.error("Error fetching list contents:", error);
      this.renderError("Error loading list contents.");
    }
  }

  // Add new item to list
  async addItem(content) {
    try {
      const user = getUser();
      if (!user) {
        alert("You must be logged in to add items.");
        return;
      }

      const response = await fetch(`${BASE_URL}/lists/${this.listId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}` // Auth token
        },
        body: JSON.stringify({ content }) // Send new content
      });

      if (!response.ok) throw new Error("Failed to add item");

      await this.fetchListContents(); // Refresh
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add item.");
    }
  }

  // Delete item
  async deleteItem(itemId) {
    try {
      const user = getUser();
      if (!user) {
        alert("You must be logged in to delete items.");
        return;
      }

      const response = await fetch(`${BASE_URL}/lists/${this.listId}/${itemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}` // Auth token
        }
      });

      if (!response.ok) throw new Error("Failed to delete item");

      await this.fetchListContents(); // Refresh list
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item.");
    }
  }

  // Render
  render() {
    const user = getUser(); // Check if user logged in

    this.shadowRoot.innerHTML = `
      <h3>Shopping List</h3>
      <ul>
        ${this.contents.map(item => `
          <li>
            ${item.content}
            ${user ? `<button data-id="${item.id}">Delete</button>` : ""}
          </li>
        `).join("")}
      </ul>

      ${user ? `
        <div class="add-item">
          <input type="text" placeholder="New item..." id="new-item">
          <button id="add-button">Add</button>
        </div>
      ` : `<p>Login to add or remove items.</p>`}
    `;

    // Event listeners
    if (user) {
      const addButton = this.shadowRoot.getElementById("add-button");
      const inputField = this.shadowRoot.getElementById("new-item");

      // "Add" button clicked
      addButton.addEventListener("click", () => {
        const content = inputField.value.trim();
        if (content.length > 0) {
          this.addItem(content);  // Add item
          inputField.value = "";  // Clear
        }
      });

      // Event listeners to delete buttons
      this.shadowRoot.querySelectorAll("button[data-id]").forEach(button => {
        button.addEventListener("click", () => {
          const itemId = button.getAttribute("data-id");
          this.deleteItem(itemId); // Delete selected item
        });
      });
    }
  }

  // Loading message
  renderLoading() {
    this.shadowRoot.innerHTML = `<p>Loading Shopping List...</p>`;
  }

  // Message if no shopping list found
  renderNoList() {
    this.shadowRoot.innerHTML = `
      <p>No shopping list found. Please create one in the backend portal.</p>
    `;
  }

  // Error message
  renderError(message) {
    this.shadowRoot.innerHTML = `<p style="color: red;">${message}</p>`;
  }
}

// Register the custom element
customElements.define("shopping-list-widget", ShoppingListWidget);
