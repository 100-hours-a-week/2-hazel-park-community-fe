class commentElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = this.template()
  }

  template() {
    return ``
  }
}

customElements.define('comment-element', commentElement)
