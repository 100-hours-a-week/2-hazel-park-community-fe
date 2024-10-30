import handleNavigation from '../utils/navigation.js'

class headerElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    if (localStorage.getItem('isLogin')) {
      this.isLogin = localStorage.getItem('isLogin')
    } else {
      this.isLogin = false
      localStorage.setItem('isLogin', this.isLogin)
    }
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = this.template()
    this.addEventListener()
    this.updateProfileStatus()
    this.hideProfile()
  }

  template() {
    return `
        <link rel="stylesheet" href="../styles/global.css" />
        <header>
          <div id="header-wrap" class="header-wrap">
            <img id="header-back" src='../assets/back.svg' class='header-back' />
            <p id="header-text" class="header-text">아무 말 대잔치</p>
            <div id="profile-wrap" class="profile-wrap">
              <img
                id="profile-img"
                alt="profile-img"
                class="header-profile-img"
              />
              <div id="profile-dropdown" class="profile-dropdown">
                <div id="dropdown-edit-profile" class="profile-dropdown-menu">
                  회원정보 수정
                </div>
                <div id="dropdown-edit-password" class="profile-dropdown-menu">
                  비밀번호 수정
                </div>
                <div id="dropdown-login" class="profile-dropdown-menu">
                  로그인
                </div>
                <div id="dropdown-logout" class="profile-dropdown-menu">
                  로그아웃
                </div>
              </div>
            </div>
          </div>
        </header>
      `
  }

  addEventListener() {
    const headerText = this.shadowRoot.getElementById('header-text')
    const profileImg = this.shadowRoot.getElementById('profile-img')
    const profileDropdown = this.shadowRoot.getElementById('profile-dropdown')
    const dropdownEditProfile = this.shadowRoot.getElementById(
      'dropdown-edit-profile',
    )
    const dropdownEditPassword = this.shadowRoot.getElementById(
      'dropdown-edit-password',
    )
    const dropdownLogin = this.shadowRoot.getElementById('dropdown-login')
    const dropdownLogout = this.shadowRoot.getElementById('dropdown-logout')
    const backIcon = this.shadowRoot.getElementById('header-back')

    if (headerText) {
      headerText.addEventListener('click', () =>
        handleNavigation('/html/Posts.html'),
      )
    }

    if (profileImg) {
      profileImg.addEventListener('click', (event) => {
        event.stopPropagation()
        profileDropdown.style.visibility =
          profileDropdown.style.visibility === 'visible' ? 'hidden' : 'visible'
      })
    }

    document.addEventListener('click', (event) => {
      if (profileImg && !profileImg.contains(event.target)) {
        profileDropdown.style.visibility = 'hidden'
      }
    })

    dropdownEditProfile.addEventListener('click', () =>
      handleNavigation('/html/edit-profile.html'),
    )

    dropdownEditPassword.addEventListener('click', () =>
      handleNavigation('/html/edit-password.html'),
    )

    dropdownLogin.addEventListener('click', () =>
      handleNavigation('/html/Log-in.html'),
    )

    if (dropdownLogout) {
      dropdownLogout.addEventListener('click', () => {
        this.isLogin = false
        this.updateProfileStatus()
      })
    }

    if (backIcon) {
      backIcon.addEventListener('click', () => window.history.back())
    }
  }

  updateProfileStatus() {
    const profileImg = this.shadowRoot.getElementById('profile-img')
    const dropdownEditProfile = this.shadowRoot.getElementById(
      'dropdown-edit-profile',
    )
    const dropdownEditPassword = this.shadowRoot.getElementById(
      'dropdown-edit-password',
    )
    const dropdownLogin = this.shadowRoot.getElementById('dropdown-login')
    const dropdownLogout = this.shadowRoot.getElementById('dropdown-logout')

    profileImg.src = this.isLogin
      ? '../assets/admin.png'
      : '../assets/pre-profile.png'

    dropdownEditProfile.style.display = this.isLogin ? 'block' : 'none'
    dropdownEditPassword.style.display = this.isLogin ? 'block' : 'none'
    dropdownLogin.style.display = this.isLogin ? 'none' : 'block'
    dropdownLogout.style.display = this.isLogin ? 'block' : 'none'
  }

  hideProfile() {
    const currentPath = window.location.pathname
    const profileWrap = this.shadowRoot.getElementById('profile-wrap')
    const backIcon = this.shadowRoot.getElementById('header-back')
    const headerWrap = this.shadowRoot.getElementById('header-wrap')

    if (currentPath === '/html/Log-in.html') {
      backIcon.style.display = 'none'
      profileWrap.style.display = 'none'
    } else if (currentPath === '/html/Sign-in.html') {
      profileWrap.style.display = 'none'
      headerWrap.style.paddingLeft = '36.349vw'
      headerWrap.style.paddingRight = '44.635vw'
    } else if (
      currentPath === '/html/Posts.html' ||
      currentPath === '/html/edit-profile.html' ||
      currentPath === '/html/edit-password.html'
    ) {
      backIcon.style.display = 'none'
    } else {
      headerWrap.style.paddingLeft = '35.625vw'
    }
  }
}

customElements.define('header-element', headerElement)
