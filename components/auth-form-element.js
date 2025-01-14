import handleNavigation from '/utils/navigation.js'
import { getSessionUser } from '/services/user-api.js'
import {
  checkEmailDuplicate,
  checkNicknameDuplicate,
  loginUser,
  registerUser,
} from '/services/user-api.js'

class AuthFormElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.user = null
    this.isLoginPage = true
    this.profileImageData = null
    this.emailCheck = false
    this.pwCheck = false
    this.rePwCheck = false
    this.nicknameCheck = false
  }

  async connectedCallback() {
    this.checkLocation()
    this.shadowRoot.innerHTML = this.template()
    this.user = await getSessionUser()

    const sheet = new CSSStyleSheet()
    sheet.replaceSync(`
       .input-value {
        margin-top: 1.481vh;
        padding: 1.852vh 0 1.852vh 1.25vw;
        width: 100%;
        box-sizing: border-box;
        border: none;
        border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.16));
        background-color: var(--input-value-bg, #ffffff);
        color: var(--input-value-color);
      }

      .login-submit {
        width: 355px;
        height: 33px;
        margin-top: 1vh;
        padding-top: 0.741vh;
        padding-bottom: 0.741vh;
        border: none;
        border-radius: 4px;
        color: #ffffff;
        font-weight: 500;
        font-size: 14px;
        cursor: not-allowed;
        background-color: var(--login-submit-bg);
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

    host.style.setProperty(
      '--border-color',
      isDarkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.16)',
    )
    host.style.setProperty(
      '--input-value-bg',
      isDarkMode ? '#141414' : '#f9f9f9',
    )

    host.style.setProperty('--input-value-color', isDarkMode ? '#ffffff' : '')
    host.style.setProperty(
      '--login-submit-bg',
      isDarkMode ? '#8e8e93' : '#f9f9f9',
    )
  }

  template() {
    return `
        <link rel="stylesheet" href="/styles/Log-in.css">
        <link rel="stylesheet" href="/styles/Sign-in.css">
        <div class="login-form-wrap">
            <form class="login-form">
              ${!this.isLoginPage ? this.rendingProfileImg() : ''}
                <div class="email-wrap">
                    <div class="input-title">${this.isLoginPage ? 'Email' : 'Email *'}</div>
                      <input
                        id="input-email"
                        type="email"
                        placeholder="Enter your email"
                        class="input-value"
                      />
                    <div id="email-hyper-text" style="height: 1em" class="hyper-text"></div>
                </div>
                <div style="margin-top: 0.3em" class="password-wrap">
                    <div class="input-title">${this.isLoginPage ? 'Password' : 'Password *'}</div>
                        <input
                        id="input-password"
                        type="password"
                        placeholder="Enter your password"
                        class="input-value"
                        />
                    <div id="pw-hyper-text" style="height: 2.2em" class="hyper-text"></div>
                </div>
                ${!this.isLoginPage ? this.rendingSignInForm() : ''}              
                <input id="submit" type="submit" value="${this.isLoginPage ? 'Log in' : 'Sign in'}" class="login-submit" />
            </form>
        </div>
    `
  }

  rendingProfileImg() {
    return `
      <div style="margin-bottom: 2.87vh">
        <div class="input-title">Profile</div>
          <div id="img-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text"></div>
          <label for="input-profile-img" class="input-profile-img-label">
          <img id="profile-img-preview" src="/assets/pre-profile.png" class="preview-profile-img" />
          </label>
        <input id="input-profile-img" type="file" class="input-profile-img" accept=".jpg, .jpeg, .png, .gif"  />
      </div>
    `
  }

  rendingSignInForm() {
    return `
      <div style="margin-top: 0.3em" class="password-wrap">
        <div class="input-title">Re password *</div>
        <input id="input-re-password" type="password" placeholder="Check your password" class="input-value" />
        <div id="re-pw-hyper-text" style="height: 1.7em" class="hyper-text"></div>
      </div>
      <div style="margin-top: 0.3em" class="password-wrap">
        <div class="input-title">Nickname *</div>
        <input id="input-nickname" type="text" placeholder="Enter your Email" class="input-value" />
        <div id="nickname-hyper-text" style="height: 1.7em" class="hyper-text"></div>
      </div>
    `
  }

  addEventListeners() {
    const {
      inputProfileImg,
      inputEmail,
      inputPassword,
      inputRePassword,
      inputNickname,
      submit,
    } = this.getElement()

    inputProfileImg?.addEventListener('input', () => this.checkImgUpload())
    inputEmail?.addEventListener('input', () => this.validateForm())
    inputPassword?.addEventListener('input', () => this.validateForm())
    inputEmail?.addEventListener(
      'input',
      debounce(
        () => this.checkEmail(this.escapeHtml(inputEmail.value.trim())),
        500,
      ),
    )

    inputNickname?.addEventListener(
      'input',
      debounce(
        () => this.checkNickname(this.escapeHtml(inputNickname.value.trim())),
        500,
      ),
    )

    inputRePassword?.addEventListener('input', () => this.validateForm())
    inputNickname?.addEventListener('input', () => this.validateForm())

    submit?.addEventListener('click', (event) => {
      event.preventDefault()
      const email = this.escapeHtml(inputEmail.value.trim())
      const password = this.escapeHtml(inputPassword.value.trim())

      const validationResult = this.validateForm()

      if (validationResult === 'posts') {
        this.login(email, password)
      } else if (validationResult === 'login') {
        const nickname = inputNickname.value.trim()
        this.register(email, password, nickname, this.profileImageData)
      }
    })
  }

  async checkEmail(email) {
    const emailHyperText = this.shadowRoot.getElementById('email-hyper-text')
    email = this.escapeHtml(email)
    if (!email) {
      this.emailCheck = false
      emailHyperText.innerText = '* 이메일을 입력해주세요.'
      emailHyperText.style.visibility = 'visible'
      return
    } else if (!this.emailValidCheck(email)) {
      this.emailCheck = false
      emailHyperText.innerText = '* 올바른 이메일 주소 형식을 입력해주세요.'
      emailHyperText.style.visibility = 'visible'
    } else if (!this.isLoginPage) {
      const isDuplicate = await checkEmailDuplicate(email)
      if (isDuplicate.code == 400) {
        this.emailCheck = false
        emailHyperText.innerText = `* ${isDuplicate.message}`
        emailHyperText.style.visibility = 'visible'
      } else {
        this.emailCheck = true
        emailHyperText.style.visibility = 'hidden'
      }
    } else {
      this.emailCheck = true
      emailHyperText.style.visibility = 'hidden'
    }
    this.validateForm()
  }

  async checkNickname(nickname) {
    const nicknameHyperText = this.shadowRoot.getElementById(
      'nickname-hyper-text',
    )
    nickname = this.escapeHtml(nickname)
    if (!nickname) {
      this.nicknameCheck = false
      nicknameHyperText.innerText = '* 닉네임을 입력해주세요.'
      nicknameHyperText.style.visibility = 'visible'
      return
    } else if (nickname.length > 10) {
      this.nicknameCheck = false

      nicknameHyperText.innerText = '* 닉네임은 최대 10자까지 입력 가능합니다.'
      nicknameHyperText.style.visibility = 'visible'
    } else if (/\s/.test(nickname)) {
      this.nicknameCheck = false
      nicknameHyperText.innerText = '* 띄어쓰기를 없애주세요.'
      nicknameHyperText.style.visibility = 'visible'
    } else if (!this.isLoginPage) {
      const isDuplicate = await checkNicknameDuplicate(nickname)
      if (isDuplicate.code == 400) {
        this.nicknameCheck = false
        nicknameHyperText.innerText = `* ${isDuplicate.message}`
        nicknameHyperText.style.visibility = 'visible'
      } else {
        this.nicknameCheck = true
        nicknameHyperText.style.visibility = 'hidden'
      }
    } else {
      this.nicknameCheck = true
      nicknameHyperText.style.visibility = 'hidden'
    }
    this.validateForm()
  }

  getElement() {
    const getElement = (id) => this.shadowRoot.getElementById(id)
    return {
      inputProfileImg: getElement('input-profile-img'),
      inputEmail: getElement('input-email'),
      inputPassword: getElement('input-password'),
      inputRePassword: getElement('input-re-password'),
      inputNickname: getElement('input-nickname'),
      submit: getElement('submit'),
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
    submit.style.backgroundColor = ''
    submit.style.cursor = 'not-allowed'

    pwHyperText.innerText = ''
    if (rePwHyperText) {
      rePwHyperText.innerText = ''
    }

    if (!inputEmail.value.trim()) {
      this.emailCheck = false
      emailHyperText.innerText = '* 이메일을 입력해주세요.'
      emailHyperText.style.visibility = 'visible'
    }

    if (!inputPassword.value.trim()) {
      this.pwCheck = false
      pwHyperText.style.visibility = 'visible'
      pwHyperText.innerText = '* 비밀번호를 입력해주세요.'
    } else if (!this.pwValidCheck(inputPassword.value.trim())) {
      this.pwCheck = false
      pwHyperText.innerText =
        '* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
      pwHyperText.style.visibility = 'visible'
    } else {
      this.pwCheck = true
      pwHyperText.style.visibility = 'hidden'
    }

    if (inputRePassword) {
      if (!inputRePassword.value.trim()) {
        this.rePwCheck = false
        rePwHyperText.style.visibility = 'visible'
        rePwHyperText.innerText = '* 비밀번호를 한 번 더 입력해주세요.'
      } else if (inputRePassword.value.trim() !== inputPassword.value.trim()) {
        this.rePwCheck = false
        rePwHyperText.style.visibility = 'visible'
        rePwHyperText.innerText = '* 비밀번호가 다릅니다.'
      } else {
        this.rePwCheck = true
        rePwHyperText.style.visibility = 'hidden'
      }

      if (!inputNickname.value.trim()) {
        this.nicknameCheck = false
        nicknameHyperText.innerText = '닉네임을 입력해주세요.'
        nicknameHyperText.style.visibility = 'visible'
      }
    }

    if (!inputRePassword && !inputNickname) {
      if (this.emailCheck && this.pwCheck) {
        submit.style.backgroundColor = '#0a84ff'
        submit.style.cursor = 'pointer'
        return 'posts'
      }
    } else {
      if (
        this.emailCheck &&
        this.pwCheck &&
        this.rePwCheck &&
        this.nicknameCheck
      ) {
        submit.style.backgroundColor = '#0a84ff'
        submit.style.cursor = 'pointer'
        return 'login'
      }
    }
  }

  emailValidCheck(email) {
    const pattern = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z\-]+$/
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
    const profileImgPreview = this.shadowRoot.getElementById(
      'profile-img-preview',
    )
    const inputProfileImgLabel = this.shadowRoot.getElementById(
      'input-profile-img-label',
    )

    const maxFileSize = 5 * 1024 * 1024 // 5MB

    if (!inputProfileImg.value) {
      profileHyperText.innerHTML = '프로필 사진을 추가해주세요.'
      profileHyperText.style.visibility = 'visible'
      if (inputProfileImgLabel) {
        inputProfileImgLabel.style.display = 'block'
      }
    } else {
      const file = inputProfileImg.files[0]

      if (file.size > maxFileSize) {
        profileHyperText.innerHTML = '파일 용량이 너무 큽니다. (최대 5MB)'
        profileHyperText.style.visibility = 'visible'
        if (profileImgPreview) {
          profileImgPreview.style.display = 'none'
        }
        if (inputProfileImgLabel) {
          inputProfileImgLabel.style.display = 'block'
        }
        return
      }

      // 이미지 미리보기
      profileHyperText.style.visibility = 'hidden'
      const reader = new FileReader()

      reader.onload = () => {
        if (profileImgPreview) {
          profileImgPreview.src = reader.result
          profileImgPreview.style.display = 'block'
          this.profileImageData = reader.result
        }
      }

      reader.readAsDataURL(file)
      if (inputProfileImgLabel) {
        inputProfileImgLabel.style.display = 'none'
      }
    }
  }

  async login(email, password) {
    try {
      const user = await loginUser(email, password)
      if (!user) {
        alert('회원 정보가 존재하지 않습니다.')
        return
      }
      handleNavigation('/html/Posts.html')
    } catch (error) {
      alert(error.message)
    }
  }

  async register(email, password, nickname, profilePic) {
    try {
      const result = await registerUser(email, password, nickname, profilePic)
      if (result === '이미 존재하는 이메일입니다.') {
        let emailHyperText = this.shadowRoot.getElementById('email-hyper-text')
        emailHyperText.innerText = result
        emailHyperText.style.visibility = 'visible'
      } else if (result === '중복된 닉네임 입니다.') {
        let nicknameHyperText = this.shadowRoot.getElementById(
          'nickname-hyper-text',
        )
        nicknameHyperText.innerText = result
        nicknameHyperText.style.visibility = 'visible'
      } else {
        handleNavigation('/html/Log-in.html')
      }
    } catch (error) {
      alert(error.message)
    }
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}

function debounce(func, delay) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => func.apply(this, args), delay)
  }
}

customElements.define('auth-form-element', AuthFormElement)
