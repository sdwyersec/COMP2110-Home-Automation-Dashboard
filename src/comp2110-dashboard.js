import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import './components/widget-block.js';
import './components/widget-column.js';
import './components/ad-widget.js';
import './components/login-widget.js';
<<<<<<< HEAD
import './components/device-controller.js';

=======
import './device-sensor-control-widget.js';
import './shopping-list-widget.js';
import './home-overview-widget.js';
>>>>>>> e56f62665f122182785f7d88b2042415c5807a56

class Comp2110Dashboard extends LitElement {
  static properties = {
    header: { type: String },
  };

  static styles = css`
    :host {
      min-height: 100vh;
      font-size: 14pt;
      color: rgba(26, 43, 66, 0);
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
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
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
      font-size: calc(12px + 0.5vmin);
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

<<<<<<< HEAD
<main>
  <widget-column header="Left">
    <widget-block header="First Widget"></widget-block>
    <widget-block header="Second Widget"></widget-block>
    <widget-block header="Third Widget"></widget-block>
  </widget-column>  

  <widget-column header="Middle">
    <widget-block header="First Widget"></widget-block>
    <widget-block header="Second Widget"></widget-block>
    <widget-block header="Third Widget"></widget-block>
  </widget-column>  

  <widget-column header="Right">
    <ad-widget></ad-widget>
    <device-controller deviceId="1"></device-controller>
    <widget-block header="Fourth Widget"></widget-block>
    <widget-block header="Fifth Widget"></widget-block>
  </widget-column>
</main>

=======
        <hr />
>>>>>>> e56f62665f122182785f7d88b2042415c5807a56

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
          </widget-column>
        </main>

        <!-- Second Row -->
        <main>
          <widget-column>
            <home-overview-widget></home-overview-widget>
          </widget-column>
          <widget-column>
            <!-- widget -->
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
