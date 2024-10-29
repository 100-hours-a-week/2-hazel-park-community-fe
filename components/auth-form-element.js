import handleNavigation from '../utils/navigation.js'

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
                    '<div id="img-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text"></div>' +
                    '<label for="input-profile-img" class="input-profile-img-label">' +
                    '<img src="../assets/plus.svg" class="plus-icon" />' +
                    '</label>' +
                    '<input id="input-profile-img" type="file" class="input-profile-img" accept="image/*" />' +
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
                    <div id="pw-hyper-text" style="height: 2.2em" class="hyper-text"></div>
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
    const inputProfileImg = this.shadowRoot.getElementById('input-profile-img')
    const inputEmail = this.shadowRoot.getElementById('input-email')
    const inputPassword = this.shadowRoot.getElementById('input-password')
    const inputRePassword = this.shadowRoot.getElementById('input-re-password')
    const inputNickname = this.shadowRoot.getElementById('input-nickname')
    const submit = this.shadowRoot.getElementById('submit')

    if (inputProfileImg) {
      inputProfileImg.addEventListener('input', () => this.checkImgUpload())
    }
    if (inputEmail) {
      inputEmail.addEventListener('input', () => this.validateForm())
    }
    if (inputPassword) {
      inputPassword.addEventListener('input', () => this.validateForm())
    }
    if (inputRePassword) {
      inputRePassword.addEventListener('input', () => this.validateForm())
    }
    if (inputNickname) {
      inputNickname.addEventListener('input', () => this.validateForm())
    }

    if (submit) {
      submit.addEventListener('click', (event) => {
        event.preventDefault()
        if (this.validateForm() === 'posts') {
          handleNavigation('/html/Posts.html')
        } else if (this.validateForm() === 'login') {
          handleNavigation('/html/Log-in.html')
        }
      })
    }
  }

  validateForm() {
    const inputEmail = this.shadowRoot.getElementById('input-email')
    const inputPassword = this.shadowRoot.getElementById('input-password')
    const inputRePassword = this.shadowRoot.getElementById('input-re-password')
    const inputNickname = this.shadowRoot.getElementById('input-nickname')
    let emailHyperText = this.shadowRoot.getElementById('email-hyper-text')
    let pwHyperText = this.shadowRoot.getElementById('pw-hyper-text')
    let rePwHyperText = this.shadowRoot.getElementById('re-pw-hyper-text')
    let nicknameHyperText = this.shadowRoot.getElementById(
      'nickname-hyper-text',
    )
    const submit = this.shadowRoot.getElementById('submit')
    submit.style.backgroundColor = '#aea0eb'
    submit.style.cursor = 'not-allowed'

    emailHyperText.innerText = ''
    pwHyperText.innerText = ''
    if (rePwHyperText) {
      rePwHyperText.innerText = ''
      nicknameHyperText.innerText = ''
    }

    let emailCheck = false
    let pwCheck = false
    let rePwCheck = false
    let nicknameCheck = false

    if (!inputEmail.value.trim()) {
      emailCheck = false
      emailHyperText.innerText = '*이메일을 입력해주세요.'
      emailHyperText.style.visibility = 'visible'
    } else if (!this.emailValidCheck(inputEmail.value.trim())) {
      emailCheck = false
      emailHyperText.innerText = '*올바른 이메일 주소 형식을 입력해주세요.'
      emailHyperText.style.visibility = 'visible'
    } else {
      emailCheck = true
      emailHyperText.style.visibility = 'hidden'
    }

    if (!inputPassword.value.trim()) {
      pwCheck = false
      pwHyperText.style.visibility = 'visible'
      pwHyperText.innerText = '*비밀번호를 입력해주세요.'
    } else if (!this.pwValidCheck(inputPassword.value.trim())) {
      pwCheck = false
      pwHyperText.innerText =
        '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
      pwHyperText.style.visibility = 'visible'
    } else {
      pwCheck = true
      pwHyperText.style.visibility = 'hidden'
    }

    if (inputRePassword) {
      if (!inputRePassword.value.trim()) {
        rePwCheck = false
        rePwHyperText.style.visibility = 'visible'
        rePwHyperText.innerText = '*비밀번호를 한 번 더 입력해주세요.'
      } else if (inputRePassword.value.trim() !== inputPassword.value.trim()) {
        rePwCheck = false
        rePwHyperText.style.visibility = 'visible'
        rePwHyperText.innerText = '*비밀번호가 다릅니다.'
      } else {
        rePwCheck = true
        rePwHyperText.style.visibility = 'hidden'
      }

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
    }

    if (!inputRePassword && !inputNickname) {
      if (emailCheck && pwCheck) {
        submit.style.backgroundColor = '#7f6aee'
        submit.style.cursor = 'pointer'
        return 'posts'
      }
    } else {
      if (emailCheck && pwCheck && rePwCheck && nicknameCheck) {
        submit.style.backgroundColor = '#7f6aee'
        submit.style.cursor = 'pointer'
        return 'login'
      }
    }
  }

  emailValidCheck(email) {
    const pattern = /^[A-Za-z_\.\-]+@[A-Za-z\-]+\.[A-Za-z\-]+$/
    return pattern.test(email)
  }

  pwValidCheck(value) {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/.test(
      value,
    )
  }

  checkLocation() {
    const currentPath = window.location.pathname
    if (currentPath === '/html/Log-in.html') {
      this.isLoginPage = true
    } else {
      this.isLoginPage = false
    }
  }

  checkImgUpload() {
    const inputProfileImg = this.shadowRoot.getElementById('input-profile-img')
    const profileHyperText = this.shadowRoot.getElementById('img-hyper-text')

    if (!inputProfileImg.value) {
      profileHyperText.innerHTML = '프로필 사진을 추가해주세요.'
      profileHyperText.style.visibility = 'visible'
    } else {
      profileHyperText.style.visibility = 'hidden'
    }
  }
}

customElements.define('auth-form-element', AuthFormElement)
