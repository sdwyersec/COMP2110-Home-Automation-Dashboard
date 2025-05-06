import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

class WidgetColumn extends LitElement {
  static properties = {
    header: { type: String }
  };

  static styles = css`
    :host {
      display: block;
      margin: 10px;
    }

    .column {
      display: flex;
      flex-direction: column;
      align-items: center;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 10px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(5px);
    }
  `;

  constructor() {
    super();
    this.header = '';
  }

  render() {
    return html`
      <div class="column">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('widget-column', WidgetColumn);
