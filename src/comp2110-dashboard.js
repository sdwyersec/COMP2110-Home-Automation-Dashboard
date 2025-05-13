import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import './components/widget-block.js';
import './components/widget-column.js';
import './components/ad-widget.js';
import './components/login-widget.js';
import './components/device-controller.js';
import './device-sensor-control-widget.js';
import './shopping-list-widget.js';
import './home-overview-widget.js';
import './todo-widget.js';

class Comp2110Dashboard extends LitElement {
  static properties = {
    header: { type: String },
  };

  static styles = css`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');

    :host {
      min-height: 100vh;
      font-size: 14pt;
      color: white;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-image: url('./assets/background-image.jpg');
      background-size: cover;
      background-position: center;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .content-wrapper {
      width: 100%;
      background: rgba(61, 61, 61, 0.09);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.54);
      border-radius: 15px;
      padding: 20px;
      box-sizing: border-box;
      margin-top: 50px;
      margin-bottom: 30px;
    }

    header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 10px;
      position: relative; 
    }

    h1 {
      margin: 0;
      font-size: 2.5rem;
      font-family: 'Nunito', sans-serif;
      font-weight: bold;
      color: transparent; 
      position: relative;
    }

    h1::after {
      content: "COMP2110 Home Automation";
      position: absolute;
      left: 0;
      top: 0;
      color: transparent;
      background: linear-gradient(90deg,rgb(50, 18, 215),rgb(210, 31, 174), rgb(50, 18, 215));
      background-size: 200% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      animation: text-glow 8s linear infinite;
    }

    @keyframes text-glow {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    login-widget {
      margin-top: 5px;
    }

    hr {
      border: 0;
      border-top: 1px solid rgba(255, 255, 255, 0.54);
      width: 100%;
      margin: 10px 0 20px 0;
    }

    main {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .app-footer {
      font-size: calc(10px + 0.5vmin);
      color:rgba(255, 255, 255, 0.67);
    }

    .app-footer a {
      margin-left: 5px;
    }
  `;

  constructor() {
    super();
    this.header = 'COMP2110 Home Automation';
  }

  render() {
    return html`
      <div class="content-wrapper">
        <header>
          <h1>${this.header}</h1>
          <login-widget></login-widget>
        </header>

        <hr />

        <!-- First Row -->
        <main>
          <widget-column>
            <device-sensor-control-widget></device-sensor-control-widget>
          </widget-column>
          <widget-column>
            <shopping-list-widget></shopping-list-widget>
          </widget-column>
          <widget-column>
            <ad-widget></ad-widget>
            <device-controller deviceId="1"></device-controller>
          </widget-column>
        </main>

        <!-- Second Row -->
        <main>
          <widget-column>
            <home-overview-widget></home-overview-widget>
          </widget-column>
          <widget-column>
            <todo-widget></todo-widget>
          </widget-column>
          <widget-column>
            <!-- widget -->
          </widget-column>
        </main>

        <p class="app-footer">
          A product of the COMP2110 Web Development Collective &copy; 2025
        </p>
      </div>
    `;
  }
}

customElements.define('comp2110-dashboard', Comp2110Dashboard);