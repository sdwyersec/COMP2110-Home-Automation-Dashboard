import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
;

export class HomeOverviewWidget extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .location {
      margin-bottom: 20px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
    }
    .location h4 {
      margin: 0 0 10px 0;
    }
    ul {
      list-style: none;
      padding-left: 20px;
    }
    li {
      margin-bottom: 5px;
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
        fetch('https://comp2110-portal-server.fly.dev/devices', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('https://comp2110-portal-server.fly.dev/sensors', {
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
              <li>${item.label} (${item.type})</li>
            `)}
          </ul>
        </div>
      `)}
    `;
  }
}

customElements.define('home-overview-widget', HomeOverviewWidget);
