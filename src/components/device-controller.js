import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { BASE_URL } from '../config.js';
import { getUser } from '../auth.js';


class DeviceController extends LitElement {
  static properties = {
    deviceId: { type: Number },
    device: { state: true },
    loading: { state: true },
    error: { state: true }
  };

  static styles = css`
    :host {
      display: block;
      padding: 1em;
      background-color: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      margin: 1em 0;
      text-align: left;
    }

    h3 {
      margin-top: 0;
    }

    button {
      padding: 0.5em 1em;
      font-size: 1em;
    }

    .error {
      color: red;
    }

    .properties {
      margin-top: 1em;
    }
  `;

  constructor() {
    super();
    this.deviceId = null;
    this.device = null;
    this.loading = false;
    this.error = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchDevice();
  }

  async fetchDevice() {
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch(`${BASE_URL}devices/${this.deviceId}`);
      if (!response.ok) throw new Error('Failed to fetch device.');
      this.device = await response.json();
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }

  async toggleStatus() {
    const user = getUser();
    if (!user) {
      alert('Please log in to control devices.');
      return;
    }

    const newStatus = this.device.status === 'on' ? 'off' : 'on';

    try {
      const response = await fetch(`${BASE_URL}devices/${this.deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          status: newStatus,
          properties: this.device.properties || {}
        })
      });

      if (!response.ok) throw new Error('Failed to update device.');

      this.device.status = newStatus;
      this.requestUpdate();
    } catch (err) {
      alert(err.message);
    }
  }

  render() {
    console.log('Rendering <device-controller>', this.device);

    if (this.loading) {
      return html`<p>Loading device...</p>`;
    }

    if (this.error) {
      return html`<p class="error">Error: ${this.error}</p>`;
    }

    if (!this.device) {
      return html`<p>No device found.</p>`;
    }

    return html`
      <h3>${this.device.label}</h3>
      <p>Status: <strong>${this.device.status}</strong></p>
      <button @click=${this.toggleStatus}>
        Turn ${this.device.status === 'on' ? 'Off' : 'On'}
      </button>

      ${this.device.properties ? html`
        <div class="properties">
          <p>Brightness: ${this.device.properties.brightness ?? 'N/A'}</p>
          <p>Color: ${this.device.properties.color ?? 'N/A'}</p>
        </div>
      ` : ''}
    `;
  }
}

customElements.define('device-controller', DeviceController);
