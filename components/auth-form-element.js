class AuthFormElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.isLoginPage = true
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
        <div class="login-form-wrap">
            <form class="login-form">
              ${
                !this.isLoginPage
                  ? '<div style="margin-bottom: 2.87vh">' +
                    '<div class="input-title">프로필 사진</div>' +
                    '<div id="img-hyper-text" style="height: 1.7em" class="hyper-text"></div>' +
                    '<label for="input-profile-img" class="input-profile-img-label">' +
                    '<img src="../assets/plus.svg" class="plus-icon" />' +
                    '</label>' +
                    '<input type="file" id="input-profile-img" class="input-profile-img" accept="image/*" />' +
                    '</div>'
                  : ''
              }
                <div class="email-wrap">
                    <div class="input-title">${this.isLoginPage ? '이메일' : '이메일*'}</div>
                      <input
                        id="input-email"
                        type="email"
                        placeholder="이메일을 입력하세요"
                        class="input-value"
                      />
                    <div id="email-hyper-text" style="height: 1em" class="hyper-text"></div>
                </div>
                <div style="margin-top: 0.3em" class="password-wrap">
                    <div class="input-title">${this.isLoginPage ? '비밀번호' : '비밀번호*'}</div>
                        <input
                        id="input-password"
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        class="input-value"
                        />
                    <div id="pw-hyper-text" style="height: 1.7em" class="hyper-text"></div>
                </div>
                ${
                  !this.isLoginPage
                    ? '<div style="margin-top: 0.3em" class="password-wrap">' +
                      '<div class="input-title">비밀번호 확인*</div>' +
                      '<input id="input-re-password" type="password" placeholder="비밀번호를 한번 더입력하세요" class="input-value" />' +
                      '<div id="re-pw-hyper-text" style="height: 1.7em" class="hyper-text"></div>' +
                      '</div>' +
                      '<div style="margin-top: 0.3em" class="password-wrap">' +
                      '<div class="input-title">닉네임*</div>' +
                      '<input id="input-nickname" type="text" placeholder="닉네임를 입력하세요" class="input-value" />' +
                      '<div id="nickname-hyper-text" style="height: 1.7em" class="hyper-text"></div>' +
                      '</div>'
                    : ''
                }              
                <input id="submit" type="submit" value="${this.isLoginPage ? '로그인' : '회원가입'}" class="login-submit" />
            </form>
        </div>
    `
  }

  addEventListeners() {
    const inputEmail = this.shadowRoot.getElementById('input-email')
    const inputPassword = this.shadowRoot.getElementById('input-password')
    const submit = this.shadowRoot.getElementById('submit')

    inputEmail.addEventListener('input', () => this.validateForm())
    inputPassword.addEventListener('input', () => this.validateForm())

    if (submit) {
      submit.addEventListener('click', (event) => {
        event.preventDefault()
        if (this.validateForm()) {
          this.handleNavigation('/2-hazel-park-community-fe/html/Posts.html')
        }
      })
    }
  }

  validateForm() {
    const inputEmail = this.shadowRoot.getElementById('input-email')
    const inputPassword = this.shadowRoot.getElementById('input-password')
    const emailHyperText = this.shadowRoot.getElementById('email-hyper-text')
    const pwHyperText = this.shadowRoot.getElementById('pw-hyper-text')
    const submit = this.shadowRoot.getElementById('submit')

    let emailCheck = false
    let pwCheck = false

    if (
      !inputEmail.value.trim() ||
      !this.emailValidCheck(inputEmail.value.trim())
    ) {
      emailHyperText.innerText = '올바른 이메일 주소 형식을 입력해주세요.'
      emailHyperText.style.visibility = 'visible'
    } else {
      emailCheck = true
      emailHyperText.style.visibility = 'hidden'
    }

    if (!inputPassword.value.trim()) {
      pwHyperText.style.visibility = 'visible'
      pwHyperText.innerText = '비밀번호를 입력해주세요.'
    } else if (!this.pwValidCheck(inputPassword.value.trim())) {
      pwHyperText.innerText =
        '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
      pwHyperText.style.visibility = 'visible'
    } else {
      pwCheck = true
      pwHyperText.style.visibility = 'hidden'
    }

    if (emailCheck && pwCheck) {
      submit.style.backgroundColor = '#7f6aee'
      submit.style.cursor = 'pointer'
      return true
    } else {
      submit.style.backgroundColor = ''
      submit.style.cursor = 'default'
      return false
    }
  }

  emailValidCheck(email) {
    const pattern = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+$/
    return pattern.test(email)
  }

  pwValidCheck(value) {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/.test(
      value,
    )
  }

  checkLocation() {
    const currentPath = window.location.pathname
    if (currentPath === '/2-hazel-park-community-fe/html/Log-in.html') {
      this.isLoginPage = true
    } else {
      this.isLoginPage = false
    }
  }

  handleNavigation(url) {
    window.location.href = url
  }
}

customElements.define('auth-form-element', AuthFormElement)
