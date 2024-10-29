class EditFormElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.isEditProfilePage = true
  }

  connectedCallback() {
    this.checkLocation()
    this.shadowRoot.innerHTML = this.template()
    this.addEventListeners()
  }

  template() {
    return `
    <link rel="stylesheet" href="../styles/Log-in.css" />
    <link rel="stylesheet" href="../styles/Sign-in.css" />
    <link rel="stylesheet" href="../styles/edit-profile.css" />
    <div class="edit-form-wrap">
        <form class="edit-form">
          ${
            this.isEditProfilePage
              ? '<div style="margin-bottom: 2.87vh">' +
                '<div class="input-title">프로필 사진*</div>' +
                '<div id="img-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text"></div>' +
                '<label for="input-profile-img" class="input-profile-img-label">' +
                '<img src="../assets/plus.svg" class="plus-icon" />' +
                '</label>' +
                '<input id="input-profile-img" type="file" class="input-profile-img" accept="image/*" />' +
                '</div>' +
                '<div class="email-wrap">' +
                '<div class="input-title">이메일</div>' +
                '<div id="user-email" class="user-email" />user@email.com</div>' +
                '</div>' +
                '<div style="margin-top: 1rem" class="nickname-wrap">' +
                '<div class="input-title">닉네임</div>' +
                '<input id="input-nickname" type="text" placeholder="닉네임를 입력하세요" class="input-value" />' +
                '<div id="nickname-hyper-text" style="height: 1.7em" class="hyper-text"></div>' +
                '</div>'
              : '<div style="margin-top: 0.3em" class="password-wrap">' +
                '<div class="input-title">비밀번호</div>' +
                ' <input id="input-password" type="password" placeholder="비밀번호를 입력하세요" class="input-value" />' +
                '<div id="pw-hyper-text" style="height: 2.2em" class="hyper-text"></div>' +
                '</div>' +
                '<div style="margin-top: 0.3em" class="password-wrap">' +
                '<div class="input-title">비밀번호 확인*</div>' +
                '<input id="input-re-password" type="password" placeholder="비밀번호를 한번 더입력하세요" class="input-value" />' +
                '<div id="re-pw-hyper-text" style="height: 1.7em" class="hyper-text"></div>' +
                '</div>'
          }           
            <input id="submit" type="submit" value="수정하기" class="login-submit" />
        </form>
    </div>
`
  }

  addEventListeners() {
    const inputNickname = this.shadowRoot.getElementById('input-nickname')
    const submit = this.shadowRoot.getElementById('submit')
    const toastMsg = document.getElementById('done-toast')
    toastMsg.style.visibility = 'hidden'
    const deleteAccountButton = document.getElementById('delete-account')
    if (deleteAccountButton) {
      deleteAccountButton.addEventListener('click', () => this.openModal())
    }

    if (inputNickname) {
      inputNickname.addEventListener('input', () => this.validateForm())
    }

    if (submit) {
      submit.addEventListener('click', (event) => {
        event.preventDefault()
        if (this.validateForm()) {
          toastMsg.style.visibility = 'visible'
        }
        //   this.handleNavigation('/html/Posts.html')
        // } else if (this.validateForm() === 'login') {
        //   this.handleNavigation('/html/Log-in.html')
        // }
      })
    }
  }

  openModal() {
    const modalBackground = document.createElement('div')
    modalBackground.classList.add('modal-background')

    const modal = document.createElement('modal-element')

    document.body.appendChild(modalBackground)
    document.body.appendChild(modal)

    modalBackground.addEventListener('click', () => this.closeModal())
  }

  validateForm() {
    const inputNickname = this.shadowRoot.getElementById('input-nickname')
    let nicknameHyperText = this.shadowRoot.getElementById(
      'nickname-hyper-text',
    )

    const submit = this.shadowRoot.getElementById('submit')
    submit.style.backgroundColor = '#aea0eb'
    submit.style.cursor = 'not-allowed'

    if (nicknameHyperText) {
      nicknameHyperText.innerText = ''
    }

    let nicknameCheck = false

    if (!inputNickname.value.trim()) {
      nicknameCheck = false
      nicknameHyperText.innerText = '닉네임을 입력해주세요.'
      nicknameHyperText.style.visibility = 'visible'
    } else if (inputNickname.value.trim().length > 10) {
      nicknameCheck = false
      nicknameHyperText.innerText = '닉네임은 최대 10자까지 입력 가능합니다.'
      nicknameHyperText.style.visibility = 'visible'
    } else if (/\s/.test(inputNickname.value.trim())) {
      nicknameCheck = false
      nicknameHyperText.innerText = '띄어쓰기를 없애주세요.'
      nicknameHyperText.style.visibility = 'visible'
    } else {
      nicknameCheck = true
      nicknameHyperText.style.visibility = 'hidden'
    }

    if (inputNickname) {
      if (nicknameCheck) {
        submit.style.backgroundColor = '#7f6aee'
        submit.style.cursor = 'pointer'
        return 'true'
      }
    }
  }

  checkLocation() {
    const currentPath = window.location.pathname
    if (currentPath === '/html/edit-profile.html') {
      this.isEditProfilePage = true
      console.log(true)
    } else {
      console.log(false)
      this.isEditProfilePage = false
    }
  }
}

customElements.define('edit-form-element', EditFormElement)
