import handleNavigation from '/utils/navigation.js'
import { getSessionUser } from '/services/user-api.js'
import {
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
        border-bottom: 1px solid rgba(0, 0, 0, 0.16);
        background-color: #ffffff;
      }
  
      :host-context(body.dark-mode) .input-value {
        background-color: #141414;
        border-bottom: 1px solid rgba(255, 255, 255, 0.16);
        color: #ffffff; 
      }
    `)
    this.shadowRoot.adoptedStyleSheets = [sheet]

    this.addEventListeners()
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
                <button type="button" id="changeImageBtn" class="profile-img-change-btn">변경</button>
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
          <div class="input-title">Nickname *</div>
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
    inputNickname?.addEventListener('input', () => this.validateForm())
    inputPassword?.addEventListener('input', () => this.validateForm())
    inputRePassword?.addEventListener('input', () => this.validateForm())

    submit?.addEventListener('click', async (event) => {
      event.preventDefault()

      const validationResult = this.validateForm()
      if (validationResult === 'nickname') {
        if (this.newImageData) {
          this.user.profile_picture = this.newImageData
        }

        const nickname = inputNickname.value.trim()
        this.user.nickname = nickname

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
      } else if (validationResult === 'password') {
        const password = inputPassword.value.trim()
        this.user.user_pw = password
        // localStorage.setItem('user', JSON.stringify(this.user))
        await patchUserPw(this.user.email, password)
        this.showToastAndRedirect()
      }
    })
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
      //this.newImageData = file

      imgHyperText.innerText =
        '수정하기 버튼을 누르면 프로필 이미지가 변경됩니다.'
      imgHyperText.style.visibility = 'visible'

      setTimeout(() => {
        imgHyperText.style.visibility = 'hidden'
      }, 3000)
    }

    reader.readAsDataURL(file)
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

    let nicknameHyperText = this.shadowRoot.getElementById(
      'nickname-hyper-text',
    )
    let pwHyperText = this.shadowRoot.getElementById('pw-hyper-text')
    let rePwHyperText = this.shadowRoot.getElementById('re-pw-hyper-text')

    const submit = this.shadowRoot.getElementById('submit')
    submit.style.backgroundColor = '#aea0eb'
    submit.style.cursor = 'not-allowed'

    if (nicknameHyperText) {
      nicknameHyperText.innerText = ''
    }
    if (pwHyperText || rePwHyperText) {
      pwHyperText.innerText = ''
      rePwHyperText.innerText = ''
    }

    let nicknameCheck = false
    let pwCheck = false
    let rePwCheck = false

    if (inputNickname) {
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

    if (inputNickname) {
      if (nicknameCheck) {
        submit.style.backgroundColor = '#7f6aee'
        submit.style.cursor = 'pointer'
        return 'nickname'
      }
    } else if (inputPassword) {
      if (pwCheck && rePwCheck) {
        submit.style.backgroundColor = '#7f6aee'
        submit.style.cursor = 'pointer'
        return 'password'
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
}

customElements.define('edit-form-element', EditFormElement)
