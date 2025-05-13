import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { BASE_URL } from '../config.js';

export class DeviceSensorControlWidget extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      color: black;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    input, select, button {
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    button {
      background-color: #1976d2;
      color: white;
      cursor: pointer;
    }
    button:hover {
      background-color: #125aa1;
    }
  `;

  constructor() {
    super();
    this.label = '';
    this.type = 'light';
    this.location = '';
    this.mode = 'device';
  }

  handleInput(e) {
    this[e.target.name] = e.target.value;
  }

  async handleSubmit(e) {
    e.preventDefault();

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
        alert('✅ Successfully created!');
        console.log('Created:', result);
      } else {
        console.error('Server responded with error:', result);
        alert(`❌ Failed to create: ${result.error || 'Invalid input or server issue'}`);
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('🚫 Network error occurred. See console for details.');
    }
  }

  render() {
    return html`
      <h3>Create New Device or Sensor</h3>
      <form @submit="${this.handleSubmit}">
        <select name="mode" @change="${this.handleInput}">
          <option value="device" selected>Device</option>
          <option value="sensor">Sensor</option>
        </select>

        <input
          type="text"
          name="label"
          placeholder="Label"
          @input="${this.handleInput}"
          required
        />

        <input
          type="text"
          name="type"
          placeholder="Type (e.g., light, heater, tempHumidity)"
          @input="${this.handleInput}"
          required
        />

        <input
          type="number"
          name="location"
          placeholder="Location ID (e.g., 1)"
          @input="${this.handleInput}"
          required
        />

        <button type="submit">Create</button>
      </form>
    `;
  }
}

customElements.define('device-sensor-control-widget', DeviceSensorControlWidget);
