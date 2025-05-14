import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { BASE_URL } from '../config.js';

export class DeviceSensorControlWidget extends LitElement {
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
      backdrop-filter: blur(5px);
    }

    h3 {
      text-align: center;
      margin-bottom: 1rem;
      color: #ffffff;
      font-size: 25px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    input, select {
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      background: rgba(255, 0, 251, 0.2);
      color: white;
      backdrop-filter: blur(5px);
    }

    input::placeholder {
      color: #ccc;
    }

    select {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 1rem;
    }

    button {
      background-color: rgb(60, 61, 105);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.75rem;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.2s ease;
      margin-top: 0.5rem;
    }

    button:hover {
      background-color: #52537e;
    }

    .error {
      color: #ff6b6b;
      text-align: center;
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }

    .success {
      color: #6bff6b;
      text-align: center;
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }
  `;

  constructor() {
    super();
    this.label = '';
    this.type = 'light';
    this.location = '';
    this.mode = 'device';
    this.error = '';
    this.success = '';
  }

  handleInput(e) {
    this[e.target.name] = e.target.value;
    this.error = '';
    this.success = '';
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.error = '';
    this.success = '';

    const url = this.mode === 'device'
      ? `${BASE_URL}/devices`
      : `${BASE_URL}/sensors`;

    const payload = this.mode === 'device' ? {
      label: this.label,
      type: this.type,
      location: Number(this.location),
      status: 'off',
      properties: {
        brightness: 50,
        color: '#ffffff'
      }
    } : {
      label: this.label,
      type: this.type,
      location: Number(this.location),
      properties: null
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (response.ok) {
        this.success = '✅ Successfully created!';
        console.log('Created:', result);
        // Clear form on success
        this.label = '';
        this.type = 'light';
        this.location = '';
      } else {
        this.error = result.error || 'Invalid input or server issue';
        console.error('Server responded with error:', result);
      }
    } catch (err) {
      this.error = 'Network error occurred. Please try again.';
      console.error('Network error:', err);
    }
  }

  render() {
    return html`
      <h3>Create New Device or Sensor</h3>
      
      ${this.error ? html`<div class="error">${this.error}</div>` : ''}
      ${this.success ? html`<div class="success">${this.success}</div>` : ''}

      <form @submit="${this.handleSubmit}">
        <select name="mode" @change="${this.handleInput}">
          <option value="device" selected>Device</option>
          <option value="sensor">Sensor</option>
        </select>

        <input
          type="text"
          name="label"
          placeholder="Label"
          .value=${this.label}
          @input="${this.handleInput}"
          required
        />

        <input
          type="text"
          name="type"
          placeholder="Type (e.g., light, heater, tempHumidity)"
          .value=${this.type}
          @input="${this.handleInput}"
          required
        />

        <input
          type="number"
          name="location"
          placeholder="Location ID (e.g., 1)"
          .value=${this.location}
          @input="${this.handleInput}"
          required
        />

        <button type="submit">Create</button>
      </form>
    `;
  }
}

customElements.define('device-sensor-control-widget', DeviceSensorControlWidget);