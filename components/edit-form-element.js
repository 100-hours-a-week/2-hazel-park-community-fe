import handleNavigation from '../utils/navigation.js'
import { patchUserNickname, patchUserPw } from '../services/user-api.js'

class EditFormElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.isEditProfilePage = true
    this.storedData = JSON.parse(localStorage.getItem('user'))
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
                `<div id="user-email" class="user-email" />${this.storedData.user_email}</div>` +
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
    const inputPassword = this.shadowRoot.getElementById('input-password')
    const inputRePassword = this.shadowRoot.getElementById('input-re-password')
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
    if (inputPassword) {
      inputPassword.addEventListener('input', () => this.validateForm())
    }
    if (inputRePassword) {
      inputRePassword.addEventListener('input', () => this.validateForm())
    }

    if (submit) {
      submit.addEventListener('click', async (event) => {
        event.preventDefault()

        const validationResult = this.validateForm()
        if (validationResult === 'nickname') {
          const nickname = this.shadowRoot
            .getElementById('input-nickname')
            .value.trim()
          this.storedData.user_name = nickname
          localStorage.setItem('user', JSON.stringify(this.storedData))

          const result = await patchUserNickname(
            this.storedData.user_email,
            nickname,
          )
          let nicknameHyperText = this.shadowRoot.getElementById(
            'nickname-hyper-text',
          )

          if (result === 400) {
            nicknameHyperText.innerText = '중복된 닉네임 입니다.'
            nicknameHyperText.style.visibility = 'visible'
          } else {
            nicknameHyperText.style.visibility = 'hidden'
            toastMsg.style.visibility = 'visible'
          }
        } else if (validationResult === 'password') {
          const password = this.shadowRoot
            .getElementById('input-password')
            .value.trim()
          this.storedData.user_pw = password
          localStorage.setItem('user', JSON.stringify(this.storedData))
          await patchUserPw(this.storedData.user_email, password)
          toastMsg.style.visibility = 'visible'
        }
      })
    }
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
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/.test(
      value,
    )
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

  deleteUser() {
    this.isLogin = false
    localStorage.setItem('isLogin', this.isLogin)
    localStorage.removeItem('user')
    handleNavigation('/html/Log-in.html')
  }
}

customElements.define('edit-form-element', EditFormElement)
