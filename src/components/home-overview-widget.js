import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class HomeOverviewWidget extends LitElement {

  // Style
  static styles = css`
    :host {
      display: block;
      background: rgba(255, 255, 255, 0.05);
      padding: 1rem;
      border-radius: 16px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      margin: 1rem 0;
      color: #fff;
      font-family: 'Segoe UI', sans-serif;
    }

    h2 {
      margin-top: 0;
      font-size: 1.5rem;
      text-align: center;
      color: #ffffff;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0.5rem 0;
    }

    li {
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    li:last-child {
      border-bottom: none;
    }

    .error {
      color: #ff6b6b;
      text-align: center;
    }

    .loading {
      color: #cccccc;
      text-align: center;
    }
  `;

  constructor() {
    super();
    this.locations = {};
    this.devices = [];
    this.sensors = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadData();
  }

  async loadData() {
    try {
      const [locRes, devRes, sensRes] = await Promise.all([
        fetch('https://comp2110-portal-server.fly.dev/home/locations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('https://comp2110-portal-server.fly.dev/home/devices', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('https://comp2110-portal-server.fly.dev/home/sensors', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      const locData = await locRes.json();
      const devData = await devRes.json();
      const sensData = await sensRes.json();

      this.locations = locData.reduce((acc, loc) => {
        acc[loc.id] = loc.name;
        return acc;
      }, {});

      this.devices = devData;
      this.sensors = sensData;

      this.requestUpdate();
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }

  showItemInfo(item) {
    alert(`📋 Device/Sensor Info:\n\nLabel: ${item.label}\nType: ${item.type}\nLocation: ${this.locations[item.location] || 'Unknown'}`);
  }

  render() {
    const grouped = {};

    // Group devices and sensors by location
    [...this.devices, ...this.sensors].forEach(item => {
      const loc = item.location;
      if (!grouped[loc]) grouped[loc] = [];
      grouped[loc].push(item);
    });

    return html`
      <h3>Home Overview</h3>
      ${Object.entries(grouped).map(([locId, items]) => html`
        <div class="location">
          <h4>${this.locations[locId] || 'Unknown Location'}</h4>
          <ul>
            ${items.map(item => html`
              <li @click=${() => this.showItemInfo(item)}>
                <strong>${item.label}</strong> (${item.type})
              </li>
            `)}
          </ul>
        </div>
      `)}
    `;
  }
}

customElements.define('home-overview-widget', HomeOverviewWidget);
