import handleNavigation from '../utils/navigation.js'

class ModalElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = this.template()
    this.addEventListeners()
  }

  template() {
    return `
      <link rel="stylesheet" href="../styles/global.css" />
      <link rel="stylesheet" href="../styles/modal-element.css" />
      <div class="modal-background"></div>
      <div class="modal-wrap">
          <section class="modal-title">
              <div style="background-color: #ffffff">회원탈퇴 하시겠습니까?</div>
          </section>
          <section class="modal-description">
              <div style="background-color: #ffffff">작성된 게시글과 댓글은 삭제됩니다.</div>
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
    acceptButton.addEventListener('click', () => this.confirmDeletion())
  }

  closeModal() {
    this.remove()
  }

  confirmDeletion() {
    this.closeModal()
    console.log('계정 삭제 확인됨.')
    handleNavigation('/html/Log-in.html')
  }
}

customElements.define('modal-element', ModalElement)
