import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { getUser, storeUser, deleteUser} from '../auth.js';
import { BASE_URL } from '../config.js';

class LoginWidget extends LitElement {
  static properties = {
    loginUrl: { type: String },
    user: { type: String, state: true }
  }

  static styles = css`
    :host {
      display: block;
      font-family: 'Nunito', sans-serif;
    }

    form {
      background-color: rgb(60, 61, 105);
      color: white;
      padding: 20px;
      border-radius: 10px;
      width: 300px;
      height: 200px;  /* Fixed height */
      margin: 0 auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;  /* Center content vertically */
    }

    input[type="text"],
    input[type="password"],
    input[type="submit"] {
      width: 100%;
      padding: 12px;
      margin: 8px 0;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-sizing: border-box;
      font-size: 14px;
    }

    input[type="submit"] {
      background-color: #2d2e4f;
      color: white;
      cursor: pointer;
      border: none;
      transition: background-color 0.3s ease;
    }

    input[type="submit"]:hover {
      background-color: #1e1f3f;
    }

    button {
      background-color: #e74c3c;
      color: white;
      padding: 10px 15px;
      border-radius: 8px;
      cursor: pointer;
      border: none;
      margin-top: 10px;
      transition: background-color 0.3s ease;
    }

    button:hover {
      background-color: #c0392b;
    }

    p {
      text-align: center;
      font-size: 16px;
    }
  `;

  constructor() {
    super();
    this.loginUrl = `${BASE_URL}/users/login`;
    this.user = getUser();
  }

  submitForm(event) { 
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;
    fetch(this.loginUrl, {
        method: 'post',
        body: JSON.stringify({username, password}),
        headers: {'Content-Type': 'application/json'}
    }).then(result => result.json()).then(response => {
        this.user = response;
        localStorage.setItem('token', response.token);
localStorage.setItem('user', JSON.stringify(response));

    })
  }

  logout() {
    deleteUser();
    this.user = null;
  }

  render() {
    if (this.user) {
        return html`<p>Logged in as ${this.user.name}</p><button @click=${this.logout}>Logout</button>`;
    } 
    return html`
      <form @submit=${this.submitForm}>
          <label for="username">Username:</label>
          <input type="text" name="username" id="username" required>
          <label for="password">Password:</label>
          <input type="password" name="password" id="password" required>
          <input type='submit' value='Login'>
      </form>
    `;
  }
}

customElements.define('login-widget', LoginWidget);
