import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { BASE_URL } from '../config.js';
import { getUser } from '../auth.js';

export class DeviceController extends LitElement {
  static properties = {
    deviceId: { type: Number },
    device: { state: true },
    error: { state: true }
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
    this.deviceId = 1178;
    this.device = null;
    this.error = null;
  }

connectedCallback() {
  super.connectedCallback();
  this.fetchDevice();

const user = getUser();
if (user?.token) {
  fetch(`${BASE_URL}/home/devices`, {
    headers: {
      'Authorization': `Bearer ${user.token}`
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log(' Your devices:', data);
  })
  .catch(err => console.error('Failed to list devices:', err));
}

}


  async fetchDevice() {
    try {
      const user = getUser();
      if (!user?.token) {
        this.error = 'Not logged in';
        return;
      }

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
      this.device = await res.json();
    } catch (err) {
      this.error = err.message;
    }
  }

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
