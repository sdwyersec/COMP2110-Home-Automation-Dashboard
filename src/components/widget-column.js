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
      padding: 10px;
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
