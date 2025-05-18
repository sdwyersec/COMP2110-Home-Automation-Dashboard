  // Imports
  import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
  import './components/widget-block.js';
  import './components/widget-column.js';
  import './components/ad-widget.js';
  import './components/login-widget.js';
  import './components/device-controller.js';
  import './components/device-sensor-control-widget.js';
  import './components/shopping-list-widget.js';
  import './components/home-overview-widget.js';
  import './components/todo-widget.js';
  import './components/weather-widget.js';

  // Define main dashboard components 
  class Comp2110Dashboard extends LitElement {
    static properties = {
      header: { type: String },
      currentSlide: { type: Number },
      totalSlides: { type: Number },
    };

    // Styling
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
        font-family: 'Nunito', sans-serif; 
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
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
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

      .carousel {
        position: relative;
        width: 100%;
        overflow: hidden;
        margin-bottom: 20px;
      }

      .slides-container {
        display: flex;
        transition: transform 0.5s ease-in-out;
        width: 100%;
      }

      .slide {
        min-width: 100%;
        display: flex;
        justify-content: center;
        gap: 10px;
      }

      .carousel-nav {
        display: flex;
        justify-content: center;
        margin-top: 15px;
        gap: 10px;
      }

      .carousel-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.3s;
      }

      .carousel-btn:hover {
        background: rgba(255, 255, 255, 0.4);
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
      this.currentSlide = 1;  // Starting at slide 1
      this.totalSlides = 3;   // Total real slides
    }

    firstUpdated() {
      this.slidesContainer = this.shadowRoot.querySelector('.slides-container');
      this.updateSlidePosition();
    }

    // Moves slides container to correct slide
    updateSlidePosition() {
      this.slidesContainer.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    }

    // Advances carousel to next slide, handles looping
    nextSlide() {
      if (this.currentSlide <= this.totalSlides) {
        this.currentSlide++;
        this.updateSlidePosition();
      }

      // Loop to beginning
      if (this.currentSlide === this.totalSlides + 1) {
        setTimeout(() => {
          this.slidesContainer.style.transition = 'none';
          this.currentSlide = 1;
          this.updateSlidePosition();
          void this.slidesContainer.offsetWidth;
          this.slidesContainer.style.transition = 'transform 0.5s ease-in-out';
        }, 500);
      }
    }

    // Moves to previous slide, handles looping
    prevSlide() {
      if (this.currentSlide > 0) {
        this.currentSlide--;
        this.updateSlidePosition();
      }

      // Loop to end if goes b4 slide 1
      if (this.currentSlide === 0) {
        setTimeout(() => {
          this.slidesContainer.style.transition = 'none';
          this.currentSlide = this.totalSlides;
          this.updateSlidePosition();
          void this.slidesContainer.offsetWidth;
          this.slidesContainer.style.transition = 'transform 0.5s ease-in-out';
        }, 500);
      }
    }

    // Render dashboard
    render() {
      return html`
        <div class="content-wrapper">
          <header>
            <h1>${this.header}</h1>
            <login-widget></login-widget>
          </header>

          <hr/>

          <div class="carousel">
            <div class="slides-container">
              <!-- Duplicate Slide 3 for looping back -->
              <div class="slide">
                <widget-column></widget-column>
                <widget-column>
                  <ad-widget></ad-widget>
                </widget-column>
                <widget-column></widget-column>
              </div>

              <!-- Slide 1 -->
              <div class="slide">
                <widget-column>
                  <device-sensor-control-widget></device-sensor-control-widget>
                </widget-column>
                <widget-column>
                  <shopping-list-widget></shopping-list-widget>
                </widget-column>
                <widget-column>
                  <weather-widget></weather-widget>
                </widget-column>
              </div>

              <!-- Slide 2 -->
              <div class="slide">
                <widget-column>
                  <home-overview-widget></home-overview-widget>
                </widget-column>
                <widget-column>
                  <todo-widget></todo-widget>
                </widget-column>
                <widget-column>
                  <device-controller device-id="1178"></device-controller>
                </widget-column>
              </div>

              <!-- Slide 3 -->
              <div class="slide">
                <widget-column></widget-column>
                <widget-column>
                  <ad-widget></ad-widget>
                </widget-column>
                <widget-column></widget-column>
              </div>

              <!-- Duplicate Slide 1 for looping forward -->
              <div class="slide">
                <widget-column>
                  <device-sensor-control-widget></device-sensor-control-widget>
                </widget-column>
                <widget-column>
                  <shopping-list-widget></shopping-list-widget>
                </widget-column>
                <widget-column>
                  <weather-widget></weather-widget>
                </widget-column>
              </div>
            </div>

            <!-- Nav buttons for carousel -->
            <div class="carousel-nav">
              <button class="carousel-btn" @click=${this.prevSlide}>←</button>
              <button class="carousel-btn" @click=${this.nextSlide}>→</button>
            </div>
          </div>

          <!-- Footer text -->
          <p class="app-footer">
            A Product of the COMP2110 Web Development Collective &copy; 2025
          </p>
        </div>
      `;
    }
  }

  customElements.define('comp2110-dashboard', Comp2110Dashboard);
