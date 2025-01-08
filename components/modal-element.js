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
    const styleLink = document.createElement('link')
    styleLink.rel = 'stylesheet'
    styleLink.href = '/styles/modal-element.css'
    this.shadowRoot.appendChild(styleLink)

    const styleLink2 = document.createElement('link')
    styleLink2.rel = 'stylesheet'
    styleLink2.href = '/styles/global.css'
    this.shadowRoot.appendChild(styleLink2)

    const sheet = new CSSStyleSheet()
    sheet.replaceSync(`
      .modal-wrap {
        position: fixed;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 360px;
        height: 220px;
        border-radius: 12px; /* 전체 모달의 radius */
        text-align: center;
        background-color: var(--modal-bg, #ffffff);
        z-index: 10000;
        box-shadow: 0px 4px 10px var(--modal-wrap-shadow, rgba(0, 0, 0, 0.1)); /* 모달 그림자 */
      }

      .button-wrap {
        display: flex;
        justify-content: space-around;
        align-items: center;
        border-top: 1px solid var(--button-top-color, #d1d1d6); /* 상단 경계선 */
      }

      button {
        padding: 12px 24px; /* 버튼 내부 여백 */
        width: 50%;
        height: 52px;
        border: none;
        font-weight: 400;
        font-size: 20px;
        cursor: pointer;
        background-color: var(--modal-bg, #ffffff);
        color: #0a84ff;
      }

      .button-cancel {
        border-bottom-left-radius: 12px; 
        border-right: 1px solid var(--button-right-color ,#d1d1d6);
      }
    `)
    this.shadowRoot.adoptedStyleSheets = [sheet]

    this.setupThemeObserver()

    this.addEventListeners()
  }

  setupThemeObserver() {
    // 초기 테마 설정
    this.updateThemeVariables()

    // body의 class 변경 감지
    const observer = new MutationObserver(() => {
      this.updateThemeVariables()
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }

  updateThemeVariables() {
    const isDarkMode = document.body.classList.contains('dark-mode')
    const host = this.shadowRoot.host

    host.style.setProperty('--modal-bg', isDarkMode ? '#1C1C1E' : '#ffffff')
    host.style.setProperty(
      '--modal-wrap-shadow',
      isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    )
    host.style.setProperty(
      '--button-top-color',
      isDarkMode ? '#48484a' : '#d1d1d6',
    )
    host.style.setProperty(
      '--button-right-color',
      isDarkMode ? '#48484a' : '#d1d1d6',
    )
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
      <link rel="stylesheet" href="/styles/global.css">
      <div class="modal-background"></div>
      <div class="modal-wrap" id="modal-wrap">
          <section class="modal-title">
              <div >${this.getAttribute('title-text') || '회원탈퇴 하시겠습니까?'}</div>
          </section>
          <section class="modal-description">
              <div >${this.getAttribute('description-text') || '작성된 게시글과 댓글은 삭제됩니다.'}</div>
          </section>
          <section class="modal-buttons">
              <div class="button-wrap">
                  <button class="button-cancel">Cancel</button>
                  <button class="button-accept" style="border-bottom-right-radius: 12px;">Ok</button>
              </div>
          </section>
      </div>
    `
  }

  addEventListeners() {
    const cancelButton = this.shadowRoot.querySelector('.button-cancel')
    const acceptButton = this.shadowRoot.querySelector('.button-accept')
    const modalBackground = this.shadowRoot.querySelector('.modal-background')

    cancelButton.addEventListener('click', () => this.closeModal())
    acceptButton.addEventListener('click', () => {
      if (typeof this._onConfirm === 'function') {
        this._onConfirm()
      }
      this.closeModal()
    })

    modalBackground.addEventListener('click', () => this.closeModal())
  }

  closeModal() {
    this.remove()
  }
}

customElements.define('modal-element', ModalElement)
