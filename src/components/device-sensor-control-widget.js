// Imports
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { BASE_URL } from '../config.js';

export class DeviceSensorControlWidget extends LitElement {

  // Style
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
      
    .debug-info {
      font-size: 0.8rem;
      color: #aaa;
      margin-top: 1rem;
      word-break: break-all;
    }
  `;

  // Declare properties 
  static properties = {
    label: { type: String },       // Label of device/sensor
    type: { type: String },        // Type
    location: { type: String },    // Location from dropdown
    mode: { type: String },        // 'device' or 'sensor'  toggle
    error: { type: String },       // Error msg
    debugInfo: { type: String },   // Debug stuff
    locations: { type: Array }     // List of locations fetched from server
  };

  constructor() {
    super();
    this.resetForm();
    this.debugInfo = '';
    this.locations = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchLocations();
  }

  // Reset form fields 
  resetForm() {
    this.label = '';
    this.type = '';
    this.location = '';
    this.mode = 'device'; // Default mode is device ^-_-^
    this.error = '';
  }

  // Fetch location data from backend
  async fetchLocations() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BASE_URL}/home/locations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        this.locations = Array.isArray(data.locations) ? data.locations : [];
      } else {
        console.error('Failed to fetch locations:', response.statusText);
        this.locations = [];
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
      this.locations = [];
    }
  }

  // Handle input and select changes
  handleInput(e) {
    this[e.target.name] = e.target.value;
    this.error = '';
  }

  // Handle form submission
  async handleSubmit(e) {
    e.preventDefault();
    this.error = '';
    this.debugInfo = '';

    // Validate fields
    if (!this.label || !this.location) {
      this.error = 'Please fill in all required fields';
      return;
    }

    const endpoint = this.mode === 'device' ? '/home/devices' : '/home/sensors';
    const url = `${BASE_URL}${endpoint}`;

    const payload = this.mode === 'device'
      ? {
          label: this.label,
          location: this.location,
          status: 'off',
          properties: { type: this.type, brightness: 50, color: '#ffffff' }
        }
      : {
          label: this.label,
          location: this.location,
          type: this.type
        };

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      // Debugging 
      this.debugInfo = `Sending to ${url}\nPayload: ${JSON.stringify(payload, null, 2)}`;

      // Send POST request to create device or sensor
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      // Reset form fields after creation
      this.resetForm();

      this.dispatchEvent(new CustomEvent('device-or-sensor-created', {
        bubbles: true,
        composed: true,
        detail: { type: this.mode, data: await response.json() }
      }));

    } catch (err) {
      console.error('Creation failed:', err);
      this.error = err.message;
      this.debugInfo += `\nError: ${err.message}`;  // Debug
    }
  }

  // Render
  render() {
    return html`
      <h3>Create New Device or Sensor</h3>
      <form @submit="${this.handleSubmit}">
        <select name="mode" @change="${this.handleInput}">
          <option value="device" ?selected=${this.mode === 'device'}>Device</option>
          <option value="sensor" ?selected=${this.mode === 'sensor'}>Sensor</option>
        </select>

        <!-- Label input -->
        <input
          type="text"
          name="label"
          placeholder="Label (e.g., Living Room Light)"
          .value=${this.label}
          @input="${this.handleInput}"
          required
        />

        <!-- Type input with placeholder -->
        <input
          type="text"
          name="type"
          placeholder="${this.mode === 'device' ? 'Device Type (e.g., light, heater)' : 'Sensor Type (e.g., tempHumidity, motion)'}"
          .value=${this.type}
          @input="${this.handleInput}"
          required
        />

        <!-- Location dropdown -->
        <select name="location" @change="${this.handleInput}" required>
          <option value="" disabled ?selected=${!this.location}>Select Location</option>
          ${this.locations.map(loc => html`
            <option value="${loc.label}" ?selected=${this.location === loc.label}>${loc.label}</option>
          `)}
        </select>

        <!-- Submit button -->
        <button type="submit">Create</button>
      </form>

      <!-- Error msg if any -->
      ${this.error ? html`<div class="error">${this.error}</div>` : ''}
    `;
  }
}

customElements.define('device-sensor-control-widget', DeviceSensorControlWidget);
