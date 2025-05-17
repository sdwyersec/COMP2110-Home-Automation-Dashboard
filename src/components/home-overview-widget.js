// Import
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class HomeOverviewWidget extends LitElement {

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
      max-width: 350px;
      height: 410px;
      overflow-y: auto;
    }

    h3 {
      text-align: center;
      margin-bottom: 1rem;
      color: #ffffff;
      font-size: 25px;
    }

    h4 {
      margin: 1rem 0 0.5rem;
      font-size: 1.1rem;
      color: #ddd;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      max-height: 250px;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
    }

    ul::-webkit-scrollbar {
      width: 8px;
    }

    ul::-webkit-scrollbar-track {
      background: transparent;
    }

    ul::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }

    ul::-webkit-scrollbar-thumb:hover {
      background-color: rgba(255, 255, 255, 0.5);
    }

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
    }

    li:last-child {
      border-bottom: none;
    }

    .item-label {
      flex: 1;
    }
  `;

  constructor() {
    super();
    this.devices = [];  // List of devices
    this.sensors = [];  // List of sensors
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadData();
  }

  // Fetch devices and sensors from the backend
  async loadData() {
    try {
      const [devRes, sensRes] = await Promise.all([
        fetch('https://comp2110-portal-server.fly.dev/home/devices', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('https://comp2110-portal-server.fly.dev/home/sensors', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const devData = await devRes.json();
      const sensData = await sensRes.json();

      this.devices = Array.isArray(devData) ? devData : devData.devices || [];
      this.sensors = Array.isArray(sensData) ? sensData : sensData.sensors || [];

      // Notify Lit to re-render UI!!
      this.requestUpdate();
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }

  // Show popup w info about item
  showItemInfo(item) {
    alert(`Device/Sensor Info:\n\nLabel: ${item.label}\nType: ${item.type}\nLocation: ${item.location || 'Unknown'}`);
  }

  // Render baby
  render() {
    const grouped = {}; // Object to group items by location

    // Combine devices & sensors, group by location
    [...this.devices, ...this.sensors].forEach(item => {
      const loc = item.location || 'Unknown Location';
      if (!grouped[loc]) grouped[loc] = [];
      grouped[loc].push(item);
    });

    return html`
      <h3>Home Overview</h3>
      ${Object.entries(grouped).map(([locName, items]) => html`
        <div class="location">
          <h4>${locName}</h4>
          <ul>
            ${items.map(item => html`
              <li @click=${() => this.showItemInfo(item)}>
                <span class="item-label">
                  <strong>${item.label}</strong> (${item.type})
                </span>
              </li>
            `)}
          </ul>
        </div>
      `)}
    `;
  }
}

customElements.define('home-overview-widget', HomeOverviewWidget);
