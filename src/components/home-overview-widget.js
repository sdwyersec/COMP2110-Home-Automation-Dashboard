// Import
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { BASE_URL } from '../config.js';
import { getUser } from '../auth.js';

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
    }

    li:last-child {
      border-bottom: none;
    }

    .item-label {
      flex: 1;
      cursor: pointer;
      padding: 0.25rem 0;
    }

    .delete-btn {
      background-color:rgba(220, 42, 78, 0.84);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.35rem 0.7rem;
      cursor: pointer;
      margin-left: 0.75rem;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s ease;
      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
    }

    .delete-btn:hover {
      background-color: rgba(220, 42, 78, 0.61);
    }

    .delete-btn:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .login-alert {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 59, 48, 0.9);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .loading {
      text-align: center;
      padding: 1rem;
      color: #ccc;
    }

    .empty-state {
      text-align: center;
      padding: 1rem;
      color: #aaa;
      font-style: italic;
    }
  `;

  static properties = {
    devices: { type: Array },  
    sensors: { type: Array },   
    _showLoginAlert: { type: Boolean },
    loading: { type: Boolean }
  };

  constructor() {
    super();
    this.devices = [];  // List of devices
    this.sensors = [];  // List of sensors
    this._showLoginAlert = false;
    this.loading = false;
    this.hiddenItems = JSON.parse(localStorage.getItem('hiddenHomeItems') || '[]');
  }

  // Fetch devices and sensors from the backend
  async loadData() {
    this.loading = true;
    try {
      const user = getUser();
      if (!user?.token) return;

      const [devicesRes, sensorsRes] = await Promise.all([
        fetch(`${BASE_URL}/home/devices`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        }),
        fetch(`${BASE_URL}/home/sensors`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        })
      ]);

      const devicesData = await devicesRes.json();
      const sensorsData = await sensorsRes.json();
      
      // Filter hidden items
      this.devices = (Array.isArray(devicesData) ? devicesData : devicesData.devices || [])
        .filter(item => !this.isItemHidden(item));
      this.sensors = (Array.isArray(sensorsData) ? sensorsData : sensorsData.sensors || [])
        .filter(item => !this.isItemHidden(item));

    } catch (err) {
      console.error('Error loading data:', err);
      this.devices = [];
      this.sensors = [];
    } finally {
      this.loading = false;
    }
  }

  getItemId(item) {
    // Create ID based on item properties
    return `${item.type}-${item.label}-${item.location || 'unknown'}`;
  }

  isItemHidden(item) {
    return this.hiddenItems.includes(this.getItemId(item));
  }

  hideItem(item) {
    const itemId = this.getItemId(item);
    if (!this.hiddenItems.includes(itemId)) {
      this.hiddenItems.push(itemId);
      localStorage.setItem('hiddenHomeItems', JSON.stringify(this.hiddenItems));
      
      // Update displayed lists
      this.devices = this.devices.filter(d => this.getItemId(d) !== itemId);
      this.sensors = this.sensors.filter(s => this.getItemId(s) !== itemId);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadData();
  }

  // Render baby
  render() {
    if (this.loading) return html`<div>Loading...</div>`;
    const grouped = {}; // Object to group items by location  

    // Combine devices & sensors, group by location
    [...this.devices, ...this.sensors].forEach(item => {
      const location = item.location || 'Unknown Location';
      grouped[location] = grouped[location] || [];
      grouped[location].push(item);
    });

    return html`
      <h3>Home Overview</h3>
      
      ${this._showLoginAlert ? html`
        <div class="login-alert">Please login to modify items</div>
      ` : ''}

      ${Object.keys(grouped).length === 0 
        ? html`<p>No devices or sensors found</p>`
        : Object.entries(grouped).map(([location, items]) => html`
          <div>
            <h4>${location}</h4>
            <ul>
              ${items.map(item => html`
                <li>
                  <span class="item-label" @click=${() => this.showItemInfo(item)}>
                    <strong>${item.label}</strong> (${item.type})
                  </span>
                  <button class="delete-btn" @click=${e => {
                    e.stopPropagation();
                    this.hideItem(item);
                  }}>Delete</button>
                </li>
              `)}
            </ul>
          </div>
        `)}
    `;
  }

  // Show popup w info about item
  showItemInfo(item) {
    alert(`Device/Sensor Info:\n\nLabel: ${item.label}\nType: ${item.type}\nLocation: ${item.location || 'Unknown'}`);
  }
}

customElements.define('home-overview-widget', HomeOverviewWidget);