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

  static styles = css`
    .device-box {
      border: 2px solid #ccc;
      border-radius: 10px;
      padding: 1rem;
      margin: 1rem;
    }
    .on { background-color: #d4edda; }
    .off { background-color: #f8d7da; }
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
