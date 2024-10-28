class headerElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.isLogin = true
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
          <div class="header-wrap">
            <p class="header-text">아무 말 대잔치</p>
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
      this.handleDropdownNavigation(
        '/2-hazel-park-community-fe/html/edit-profile.html',
      ),
    )
    dropdownEditPassword.addEventListener('click', () =>
      this.handleDropdownNavigation(
        '/2-hazel-park-community-fe/html/edit-password.html',
      ),
    )
    dropdownLogin.addEventListener('click', () =>
      this.handleDropdownNavigation(
        '/2-hazel-park-community-fe/html/Log-in.html',
      ),
    )
    if (dropdownLogout) {
      dropdownLogout.addEventListener('click', () => {
        this.isLogin = false
        this.updateProfileStatus()
      })
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

    if (currentPath === '/2-hazel-park-community-fe/html/Log-in.html') {
      profileWrap.style.display = 'none'
    }
  }

  handleDropdownNavigation(url) {
    window.location.href = url
  }
}

customElements.define('header-element', headerElement)
