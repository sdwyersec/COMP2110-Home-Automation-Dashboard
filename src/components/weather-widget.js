// Import
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

// Define custom element
export class WeatherWidget extends LitElement {
   // Declare properties
  static properties = {
    location: { type: String },        // Location in coordinates format
    temperature: { type: Number },     // Current temp
    windSpeed: { type: Number },       // Current wind speed
    error: { type: String },           // Error msg
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
      width: 100%;
      max-width: 500px;
      box-sizing: border-box;
    }

    h3 {
      text-align: center;
      margin-bottom: 1rem;
    }

    .data-point {
      margin: 0.5rem 0;
    }

    .label {
      font-weight: bold;
    }

    .data {
      color: rgba(255, 255, 255, 0.84);
    }

    .error {
      color: #ff6b6b;
      text-align: center;
    }
  `;

  // Initialise properties
  constructor() {
    super();
    this.location = '';          // Start with empty location
    this.temperature = null;     // Start with temp as null
    this.windSpeed = null;       // Start with wind speed as null
    this.error = '';             // Start with error as empty
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchGeolocationWeather();  // Fetch weather
  }

  // Function fetch weather data based on geolocation :3
  async fetchGeolocationWeather() {
    if (!navigator.geolocation) {
      this.error = 'Geolocation is not supported by this browser.';  // Handle if geolocation is not supported
      return;
    }

    // Get current user location
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          // Fetch from Open-Meteo API
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`
          );
          const data = await response.json();
          // Get temp & wind speed
          this.temperature = data.current.temperature_2m;
          this.windSpeed = data.current.wind_speed_10m;
          // Format location
          this.location = `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;
        } catch (err) {
          // Handle error
          this.error = 'Failed to fetch weather data.';
          console.error(err);
        }
      },
      (err) => {
        // If geolocation access is denied
        this.error = 'Location access denied or unavailable.';
        console.error(err);
      }
    );
  }

  // HTML structure for widget
  render() {
    return html`
      <h3>Weather</h3>

      <!-- If error, display error message -->
      ${this.error
        ? html`<p class="error">${this.error}</p>`
        : html`
            <!-- Display weather data points if no error -->
            <div class="data-point"><span class="label">Location:</span> <span class="data">${this.location}</span></div>
            <div class="data-point"><span class="label">Temperature:</span> <span class="data">${this.temperature} °C</span></div>
            <div class="data-point"><span class="label">Wind Speed:</span> <span class="data">${this.windSpeed} km/h</span></div>
          `}
    `;
  }
}

// Register custom element
customElements.define('weather-widget', WeatherWidget);
