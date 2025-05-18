// Imports
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { BASE_URL } from '../config.js';
import { getUser } from '../auth.js';

export class DeviceController extends LitElement {
  static properties = {
    deviceId: { type: Number },
    device: { state: true },
    error: { state: true },
    allDevices: { state: true }
  };

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
  }

  h3 {
    text-align: center;
    margin-bottom: 1rem;
    color: #ffffff;
    font-size: 25px;
  }

  select {
    width: 100%;
    padding: 0.5rem;
    border-radius: 6px;
    background: rgba(255, 0, 251, 0.2);
    color: white;
    border: none;
    margin-bottom: 1rem;
    font-size: 1rem;
    backdrop-filter: blur(5px);
  }

  .device-box {
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem;
    border-radius: 10px;
    transition: background 0.3s ease;
  }

  .on {
    background-color: rgba(67, 241, 67, 0.3);
  }

  .off {
    background-color: rgba(255, 99, 71, 0.3);
  }

  button {
    background-color: rgb(60, 61, 105);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    margin-right: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  button:hover {
    background-color: #52537e;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  p {
    margin: 0.5rem 0;
    color: white;
  }

  label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: bold;
    color: #fff;
  }

  .error {
    color: #ff6b6b;
    text-align: center;
    margin: 1rem 0;
  }

  button + button {
    margin-top: 10px;
  }
`;

  constructor() {
    super();
    this.deviceId = null;
    this.device = null;
    this.error = null;
    this.allDevices = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchAllDevices();
  }

  async fetchAllDevices() {
  const user = getUser();
  if (!user?.token) {
    this.error = 'Not logged in';
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/home/devices`, {
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });

    if (!res.ok) throw new Error('Failed to load device list');

    const devices = await res.json();
    this.allDevices = devices.devices;

    if (this.allDevices.length > 0) {
      this.deviceId = this.allDevices[0].id;
      this.fetchDevice();
    }
  } catch (err) {
    this.error = err.message;
  }
}

  async fetchDevice() {
    const user = getUser();
    if (!user?.token) {
      this.error = 'Not logged in';
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/home/devices/${this.deviceId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch device');
      this.device = await res.json();
    } catch (err) {
      this.error = err.message;
    }
  }

  async toggleStatus() {
    const user = getUser();
    if (!user?.token) {
      this.error = 'Not logged in';
      return;
    }

    const newStatus = this.device.status === 'on' ? 'off' : 'on';

    try {
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
      this.device = await res.json();
    } catch (err) {
      this.error = err.message;
    }
  }

  handleDeviceSelect(event) {
    this.deviceId = parseInt(event.target.value);
    this.fetchDevice();
  }

  async updateStatus(newStatus) {
  const user = getUser();
  if (!user?.token) {
    this.error = 'Not logged in';
    return;
  }

  try {
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
    this.device = await res.json();

    this.requestUpdate();

  } catch (err) {
    this.error = err.message;
  }
}

  render() {
    if (this.error) {
      return html`<p>Error: ${this.error}</p>`;
    }

    return html`
      ${this.allDevices.length > 0 ? html`
        <label for="deviceSelect">Select Device:</label>
        <select id="deviceSelect" @change=${this.handleDeviceSelect}>
          ${this.allDevices.map(d => html`
            <option value="${d.id}" ?selected=${d.id === this.deviceId}>
              ${d.label}
            </option>
          `)}
        </select>
      ` : html`<p>Loading devices...</p>`}

      ${this.device ? html`
        <div class="device-box ${this.device.status}">
          <h3>${this.device.label}</h3>
          <p>Status: ${this.device.status}</p>
        <button @click=${() => this.updateStatus('on')} ?disabled=${this.device.status === 'on'}>
          Turn On
        </button>
        <button @click=${() => this.updateStatus('off')} ?disabled=${this.device.status === 'off'}>
          Turn Off
        </button>
        </div>
      ` : ''}
    `;
  }
}

customElements.define('device-controller', DeviceController);
