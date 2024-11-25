class ModalElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  static get observedAttributes() {
    return ['title-text', 'description-text']
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = this.template()
    this.addEventListeners()
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (attrName === 'title-text' || attrName === 'description-text') {
      this.render()
    }
  }

  set onConfirm(callback) {
    this._onConfirm = callback
  }

  render() {
    const titleElement = this.shadowRoot.querySelector('.modal-title div')
    const descriptionElement = this.shadowRoot.querySelector(
      '.modal-description div',
    )
    if (titleElement && descriptionElement) {
      titleElement.textContent =
        this.getAttribute('title-text') || '회원탈퇴 하시겠습니까?'
      descriptionElement.textContent =
        this.getAttribute('description-text') ||
        '작성된 게시글과 댓글은 삭제됩니다.'
    }
  }

  template() {
    return `
      <link rel="stylesheet" href="/styles/global.css" />
      <link rel="stylesheet" href="/styles/modal-element.css" />
      <div class="modal-background"></div>
      <div class="modal-wrap">
          <section class="modal-title">
              <div style="background-color: #ffffff">${this.getAttribute('title-text') || '회원탈퇴 하시겠습니까?'}</div>
          </section>
          <section class="modal-description">
              <div style="background-color: #ffffff">${this.getAttribute('description-text') || '작성된 게시글과 댓글은 삭제됩니다.'}</div>
          </section>
          <section class="modal-buttons">
              <div class="button-wrap">
                  <button class="button-cancel">취소</button>
                  <button class="button-accept">확인</button>
              </div>
          </section>
      </div>
    `
  }

  addEventListeners() {
    const cancelButton = this.shadowRoot.querySelector('.button-cancel')
    const acceptButton = this.shadowRoot.querySelector('.button-accept')

    cancelButton.addEventListener('click', () => this.closeModal())
    acceptButton.addEventListener('click', () => {
      if (typeof this._onConfirm === 'function') {
        this._onConfirm()
      }
      this.closeModal()
    })
  }

  closeModal() {
    this.remove()
  }
}

customElements.define('modal-element', ModalElement)
