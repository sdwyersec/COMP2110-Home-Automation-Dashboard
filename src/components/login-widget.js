import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { getUser, storeUser, deleteUser } from '../auth.js';
import { BASE_URL } from '../config.js';

class LoginWidget extends LitElement {
  static properties = {
    loginUrl: { type: String },
    user: { type: Object, state: true },
    showModal: { type: Boolean, state: true },
  }

  static styles = css`
    :host {
      display: block;
      font-family: 'Nunito', sans-serif;
    }

    .login-button,
    .logout-button {
      background-color: rgb(60, 61, 105);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .logout-button {
      background-color: #e74c3c;
    }

    .logout-button:hover {
      background-color: #c0392b;
    }

    .login-button:hover {
      background-color: #52537e;
    }

    .button-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 50px;
    }

    .modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.5);
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(15px);
      padding: 2rem;
      border-radius: 10px;
      width: 300px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .modal-content input[type="text"],
    .modal-content input[type="password"] {
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      border: none;
      border-radius: 6px;
      background: rgba(56, 24, 54, 0.66);
      color: white;
    }

    .form-buttons {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .modal-content input[type="submit"] {
      padding: 10px;
      background-color: #4a4c8a;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      flex: 1;
    }

    .modal-content input[type="submit"]:hover {
      background-color: #52537e;
    }

    .cancel-button {
      background-color: #ccc;
      color: black;
      border: none;
      padding: 10px;
      border-radius: 6px;
      cursor: pointer;
      flex: 1;
    }

    .cancel-button:hover {
      background-color: #bbb;
    }
  `;

  constructor() {
    super();
    this.loginUrl = `${BASE_URL}/users/login`;
    this.user = getUser();
    this.showModal = false;
  }

  submitForm(event) {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;

    fetch(this.loginUrl, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(response => {
      if (response?.token) {
        this.user = response;
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
        this.showModal = false;
      } else {
        alert('Login failed');
      }
    });
  }

  logout() {
    deleteUser();
    this.user = null;
  }

  render() {
    return html`
      <div class="button-container">
        ${this.user
          ? html`<button class="logout-button" @click=${this.logout}>Logout</button>`
          : html`<button class="login-button" @click=${() => this.showModal = true}>Login</button>`
        }
      </div>

      ${this.showModal ? html`
        <div class="modal" @click=${() => this.showModal = false}>
          <div class="modal-content" @click=${e => e.stopPropagation()}>
            <form @submit=${this.submitForm}>
              <label for="username">Username:</label>
              <input type="text" name="username" id="username" required />
              <label for="password">Password:</label>
              <input type="password" name="password" id="password" required />
              <div class="form-buttons">
                <input type="submit" value="Login" />
                <button type="button" class="cancel-button" @click=${() => this.showModal = false}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      ` : ''}
    `;
  }
}

customElements.define('login-widget', LoginWidget);
