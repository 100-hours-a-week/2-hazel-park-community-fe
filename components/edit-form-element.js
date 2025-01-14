import handleNavigation from '/utils/navigation.js'
import { getSessionUser } from '/services/user-api.js'
import {
  checkNicknameDuplicate,
  patchUserNickname,
  patchUserPw,
  deleteUser,
} from '/services/user-api.js'

class EditFormElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.isEditProfilePage = true
    this.user = null
    this.newImageData = null
    this.nicknameCheck = false
  }

  async connectedCallback() {
    this.user = await getSessionUser()
    this.checkLocation()
    this.shadowRoot.innerHTML = this.template()

    const sheet = new CSSStyleSheet()
    sheet.replaceSync(`
      .input-value {
        margin-top: 1.481vh;
        padding: 1.852vh 0 1.852vh 1.25vw;
        width: 100%;
        box-sizing: border-box;
        border: none;
        border-bottom: 1px solid var(--input-value-border, rgba(0, 0, 0, 0.16));
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
        background-color: var(--login-submit-bg-disabled, #f9f9f9);
      }

      .login-submit.enabled {
        background-color: var(--login-submit-bg-enabled, #0a84ff);
        cursor: pointer;
      }

      .login-submit.disabled {
        background-color: var(--login-submit-bg-disabled, #8e8e93);
        cursor: not-allowed;
      }

      @media all and (max-width: 479px) {
        .login-submit {
          width: 80px;
          margin: 0 auto;
        }
      }

      @media all and (min-width: 480px) and (max-width: 767px) {
        .login-submit {
          width: 160px;
          margin: 0 auto;
        }
      }

      @media all and (min-width: 768px) and (max-width: 1023px) {
        .login-submit {
          width: 200px;
          margin: 0 auto;
        }
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
      '--input-value-bg',
      isDarkMode ? '#141414' : '#f9f9f9',
    )
    host.style.setProperty(
      '--input-value-border',
      isDarkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.16)',
    )
    host.style.setProperty(
      '--input-value-color',
      isDarkMode ? '#ffffff' : 'inherit',
    )
    host.style.setProperty(
      '--login-submit-bg-enabled',
      isDarkMode ? '#0a84ff' : '#0a84ff',
    )
    host.style.setProperty(
      '--login-submit-bg-disabled',
      isDarkMode ? '#8e8e93' : '#f9f9f9',
    )
  }

  template() {
    return `
    <link rel="stylesheet" href="/styles/Log-in.css">
    <link rel="stylesheet" href="/styles/Sign-in.css">
    <link rel="stylesheet" href="/styles/edit-profile.css">
    <div class="edit-form-wrap">
        <form class="edit-form">
          ${
            this.isEditProfilePage ? this.profileForm() : this.passwordForm()
          }           
            <input id="submit" type="submit" value="Edit profile" class="login-submit" />
        </form>
    </div>
`
  }

  profileForm() {
    return `
      <div style="margin-bottom: 2.87vh">
        <div class="input-title">Profile</div>
        <div id="img-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text"></div>
      ${
        this.user.profile_picture || this.user.profile_picture === null
          ? `
              <div class="wrap-profile-img">
                <button type="button" id="changeImageBtn" class="profile-img-change-btn">Update</button>
                <input type="file" id="imageUpload" style="display: none;" accept=".jpg, .jpeg, .png, .gif" />
                <img id="profileImage" src="${this.user.profile_picture}" class="profile-img" />
              </div>
            `
          : `
              <div class="wrap-profile-img">
                <label for="imageUpload" class="input-profile-img-label">
                  <img src="/assets/plus.svg" class="plus-icon" />
                </label>
                <input id="imageUpload" type="file" class="input-profile-img" accept=".jpg, .jpeg, .png, .gif" style="display: none;" />
                <img id="profileImage" style="display: none;" class="profile-img" />
              </div>
            `
      }
        </div>
        <div class="email-wrap">
          <div class="input-title">Email</div>
          <div id="user-email" class="user-email" />${this.user.email}</div>
        </div>
        <div style="margin-top: 1rem" class="nickname-wrap">
          <div class="input-title">Nickname</div>
            <input id="input-nickname" type="text" placeholder=${this.user.nickname} class="input-value" />
            <div id="nickname-hyper-text" style="height: 1.7em" class="hyper-text"></div>
        </div>
    `
  }

  passwordForm() {
    return `
      <div style="margin-top: 0.3em" class="password-wrap">
        <div class="input-title">Password</div>
         <input id="input-password" type="password" placeholder="Enter your password" class="input-value" />
        <div id="pw-hyper-text" style="height: 2.2em" class="hyper-text"></div>
      </div>
      <div style="margin-top: 0.3em" class="password-wrap">
        <div class="input-title">Re password*</div>
        <input id="input-re-password" type="password" placeholder="Check your password" class="input-value" />
        <div id="re-pw-hyper-text" style="height: 1.7em" class="hyper-text"></div>
      </div>
    `
  }

  addEventListeners() {
    const inputNickname = this.shadowRoot.getElementById('input-nickname')
    const inputPassword = this.shadowRoot.getElementById('input-password')
    const inputRePassword = this.shadowRoot.getElementById('input-re-password')
    const submit = this.shadowRoot.getElementById('submit')

    const deleteAccountButton = document.getElementById('delete-account')

    const imageUpload = this.shadowRoot.getElementById('imageUpload')
    const changeImageBtn = this.shadowRoot.getElementById('changeImageBtn')

    if (changeImageBtn) {
      changeImageBtn.addEventListener('click', () => {
        imageUpload.click()
      })
    }

    if (imageUpload) {
      imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0]
        if (file) {
          // 파일 크기 검증
          if (file.size > 5 * 1024 * 1024) {
            // 5MB 초과 여부 확인
            alert(
              '파일 크기가 5MB를 초과했습니다. 더 작은 파일을 선택해주세요.',
            )
            imageUpload.value = '' // 선택된 파일 초기화
            return
          }

          if (this.validateImageFile(file)) {
            this.handleImageUpload(file)
          } else {
            const imgHyperText =
              this.shadowRoot.getElementById('img-hyper-text')
            imgHyperText.innerText =
              '이미지 파일만 업로드 가능합니다. (jpg, jpeg, png, gif)'
            imgHyperText.style.visibility = 'visible'
          }
        }
      })
    }

    deleteAccountButton?.addEventListener('click', () => this.openModal())
    inputNickname?.addEventListener(
      'input',
      debounce(
        () => this.checkNickname(this.escapeHtml(inputNickname.value.trim())),
        500,
      ),
    )
    inputPassword?.addEventListener('input', () => this.validateForm())
    inputRePassword?.addEventListener('input', () => this.validateForm())

    submit?.addEventListener('click', async (event) => {
      event.preventDefault()

      const validationResult = this.validateForm()
      if (this.newImageData) {
        this.user.profile_picture = this.newImageData
      }

      if (this.nicknameCheck || this.newImageData) {
        const nickname = this.escapeHtml(inputNickname.value.trim())
          ? inputNickname.value.trim()
          : null

        const result = await patchUserNickname(
          this.user.email,
          nickname,
          this.newImageData,
        )
        let nicknameHyperText = this.shadowRoot.getElementById(
          'nickname-hyper-text',
        )

        if (result === 400) {
          nicknameHyperText.innerText = '중복된 닉네임 입니다.'
          nicknameHyperText.style.visibility = 'visible'
        } else {
          nicknameHyperText.style.visibility = 'hidden'
          this.user.nickname = nickname
          // localStorage.setItem('user', JSON.stringify(this.user))
          this.showToastAndRedirect()
        }
        if (validationResult === 'password') {
          const password = this.escapeHtml(inputPassword.value.trim())
          this.user.user_pw = password
          // localStorage.setItem('user', JSON.stringify(this.user))
          await patchUserPw(this.user.email, password)
          this.showToastAndRedirect()
        }
      }
    })
  }

  async checkNickname(nickname) {
    const nicknameHyperText = this.shadowRoot.getElementById(
      'nickname-hyper-text',
    )
    const submit = this.shadowRoot.getElementById('submit')

    submit.classList.add('disabled') // 초기 상태는 비활성화

    if (!nickname) {
      this.nicknameCheck = false
      nicknameHyperText.innerText = '* 닉네임을 입력해주세요.'
      nicknameHyperText.style.visibility = 'visible'
    } else if (nickname.length > 10) {
      this.nicknameCheck = false
      nicknameHyperText.innerText = '* 닉네임은 최대 10자까지 입력 가능합니다.'
      nicknameHyperText.style.visibility = 'visible'
    } else if (/\s/.test(nickname)) {
      this.nicknameCheck = false
      nicknameHyperText.innerText = '* 띄어쓰기를 없애주세요.'
      nicknameHyperText.style.visibility = 'visible'
    } else {
      const isDuplicate = await checkNicknameDuplicate(nickname)
      if (!isDuplicate || isDuplicate.code === 400) {
        this.nicknameCheck = false
        nicknameHyperText.innerText = '* 15분 뒤에 다시 시도해 주세요.'
        nicknameHyperText.style.visibility = 'visible'
      } else {
        this.nicknameCheck = true
        this.user.nickname = nickname
        nicknameHyperText.style.visibility = 'hidden'
      }
    }

    this.validateImage()
    this.validateSubmitButton()
  }

  validateSubmitButton() {
    const submit = this.shadowRoot.getElementById('submit')

    if (this.nicknameCheck || this.newImageData) {
      submit.classList.remove('disabled')
      submit.classList.add('enabled')
      submit.disabled = false
    } else {
      submit.classList.remove('enabled')
      submit.classList.add('disabled')
      submit.disabled = true
    }
  }

  validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    return validTypes.includes(file.type)
  }

  handleImageUpload(file) {
    const reader = new FileReader()
    const profileImage = this.shadowRoot.getElementById('profileImage')
    const imgHyperText = this.shadowRoot.getElementById('img-hyper-text')

    reader.onload = (e) => {
      profileImage.src = e.target.result
      profileImage.style.display = 'block'

      this.newImageData = e.target.result

      imgHyperText.innerText =
        'Edit profile 버튼을 누르면 프로필 이미지가 변경됩니다.'
      imgHyperText.style.visibility = 'visible'

      setTimeout(() => {
        imgHyperText.style.visibility = 'hidden'
      }, 3000)

      this.validateImage()
    }

    reader.readAsDataURL(file)
  }

  validateImage() {
    const inputNickname = this.shadowRoot.getElementById('input-nickname')
    const submit = this.shadowRoot.getElementById('submit')

    // 기본 상태 초기화
    const isDarkMode = document.body.classList.contains('dark-mode')

    submit.style.backgroundColor = isDarkMode ? '#8e8e93' : '#f9f9f9'
    submit.style.cursor = 'not-allowed'
    submit.disabled = true

    // 이미지 변경 또는 닉네임 유효성 검사
    if (this.newImageData || (inputNickname && this.nicknameCheck)) {
      submit.style.backgroundColor = '#0a84ff'
      submit.style.cursor = 'pointer'
      submit.disabled = false
      return true
    }

    return false
  }

  openModal() {
    const modalBackground = document.createElement('div')
    modalBackground.classList.add('modal-background')

    const modal = document.createElement('modal-element')
    modal.setAttribute('title-text', '회원탈퇴 하시겠습니까?')
    modal.setAttribute('description-text', '작성된 게시글과 댓글은 삭제됩니다.')

    document.body.appendChild(modalBackground)
    document.body.appendChild(modal)

    modal.onConfirm = () => this.deleteUser()
    modalBackground.addEventListener('click', () => this.closeModal())
  }

  validateForm() {
    const inputNickname = this.shadowRoot.getElementById('input-nickname')
    const inputPassword = this.shadowRoot.getElementById('input-password')
    const inputRePassword = this.shadowRoot.getElementById('input-re-password')

    let pwHyperText = this.shadowRoot.getElementById('pw-hyper-text')
    let rePwHyperText = this.shadowRoot.getElementById('re-pw-hyper-text')

    const submit = this.shadowRoot.getElementById('submit')
    submit.style.backgroundColor = ''
    submit.style.cursor = 'not-allowed'

    if (pwHyperText || rePwHyperText) {
      pwHyperText.innerText = ''
      rePwHyperText.innerText = ''
    }

    let pwCheck = false
    let rePwCheck = false

    if (inputPassword) {
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
    }

    if (inputPassword) {
      if (pwCheck && rePwCheck) {
        submit.style.backgroundColor = '#0a84ff'
        submit.style.cursor = 'pointer'
        return 'password'
      }
    } else if (inputNickname) {
      if (this.newImageData) {
        submit.style.backgroundColor = '#0a84ff'
        submit.style.cursor = 'pointer'
        submit.disabled = false
        return 'nickname'
      }
    }
  }

  pwValidCheck(value) {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s])[A-Za-z\d@$!%*#?&^]{8,20}$/.test(
      value,
    )
  }

  checkLocation() {
    const currentPath = window.location.pathname
    if (currentPath === '/html/edit-profile.html') {
      this.isEditProfilePage = true
    } else {
      this.isEditProfilePage = false
    }
  }

  async deleteUser() {
    await deleteUser(this.user.email)
    handleNavigation('/html/Log-in.html')
  }

  showToastAndRedirect() {
    const toastMsg = document.getElementById('done-toast')
    toastMsg.classList.add('show')

    setTimeout(() => {
      toastMsg.classList.remove('show')
      handleNavigation('/html/Posts.html')
    }, 1500)
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

customElements.define('edit-form-element', EditFormElement)
