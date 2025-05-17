// Import
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { BASE_URL } from '../config.js';
import { getUser } from '../auth.js';

export class DeviceController extends LitElement {
  static properties = {
    deviceId: { type: Number },
    device: { state: true },
    error: { state: true }
  };

  // Styles
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
    }

    .device-box {
      padding: 1rem;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      transition: background 0.2s ease;
    }

    h3 {
      margin-top: 0;
      font-size: 1.5rem;
      text-align: center;
      color: #ffffff;
    }

    p {
      font-size: 1rem;
      text-align: center;
      margin-bottom: 1rem;
      color: #e0e0e0;
    }

    button {
      display: block;
      margin: 0 auto;
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

    .on {
      background-color: rgba(0, 255, 0, 0.1);
    }

    .off {
      background-color: rgba(255, 0, 0, 0.1);
    }
  `;

  constructor() {
    super();
    this.deviceId = 1178;
    this.device = null;
    this.error = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchDevice(); // Load device data

    // Fetch & log user devices for debugging
    const user = getUser();
    if (user?.token) {
      fetch(`${BASE_URL}/home/devices`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(data => console.log('Your devices:', data))
        .catch(err => console.error('Failed to list devices:', err));
    }
  }

  // Fetch data for specific device
  async fetchDevice() {
    try {
      const user = getUser();
      if (!user?.token) {
        this.error = 'Not logged in';
        return;
      }

      const res = await fetch(`${BASE_URL}/home/devices/${this.deviceId}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch device');
      this.device = await res.json();
    } catch (err) {
      this.error = err.message;
    }
  }

  // Toggle device statu
  async toggleStatus() {
    if (!this.device) return;

    const newStatus = this.device.status === 'on' ? 'off' : 'on';

    try {
      const user = getUser();
      if (!user?.token) {
        this.error = 'Not logged in';
        return;
      }

      const res = await fetch(`${BASE_URL}/home/devices/${this.deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          status: newStatus,
          properties: this.device.properties
        })
      });

      if (!res.ok) throw new Error('Failed to update device');
      this.device = await res.json(); // Refresh w updated data
    } catch (err) {
      this.error = err.message;
    }
  }

  // Render
  render() {
    if (this.error) {
      return html`<p>Error: ${this.error}</p>`;
    }

    if (!this.device) {
      return html`<p>Loading device...</p>`;
    }

    return html`
      <div class="device-box ${this.device.status}">
        <h3>${this.device.label}</h3>
        <p>Status: ${this.device.status}</p>
        <button @click=${this.toggleStatus}>
          Turn ${this.device.status === 'on' ? 'Off' : 'On'}
        </button>
      </div>
    `;
  }
}

customElements.define('device-controller', DeviceController);
