import handleNavigation from '/utils/navigation.js'
import { logoutUser } from '/services/user-api.js'
import { getSessionUser } from '/services/user-api.js'

class headerElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.user = null
  }

  async connectedCallback() {
    this.user = await getSessionUser()
    this.shadowRoot.innerHTML = this.template()
    const styleSheet = document.createElement('link')
    styleSheet.rel = 'stylesheet'
    styleSheet.href = '/styles/global.css'
    this.shadowRoot.prepend(styleSheet) // 스타일을 가장 먼저 추가

    const profileImg = this.shadowRoot.getElementById('profile-img')
    profileImg.src = this.user?.profile_picture || '/assets/pre-profile.png'

    this.addEventListener()
    this.updateProfileStatus()
    this.hideProfile()
  }

  template() {
    return `
        <header>
          <div id="header-wrap" class="header-wrap">
            <img id="header-back" src='/assets/back.svg' class='header-back' />
            <p id="header-text" class="header-text">아무 말 대잔치</p>
            <div id="profile-wrap" class="profile-wrap">
              <img
                id="profile-img"
                alt="profile-img"
                class="header-profile-img"
                loading="lazy"
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
    const {
      headerText,
      profileImg,
      profileDropdown,
      dropdownEditProfile,
      dropdownEditPassword,
      dropdownLogin,
      dropdownLogout,
      backIcon,
    } = this.getElements()

    headerText?.addEventListener('click', () =>
      handleNavigation('/html/Posts.html'),
    )

    profileImg?.addEventListener('click', (event) => {
      event.stopPropagation()
      profileDropdown.style.visibility =
        profileDropdown.style.visibility === 'visible' ? 'hidden' : 'visible'
    })

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

    dropdownLogout?.addEventListener('click', async () => {
      await logoutUser()
      localStorage.removeItem('user')
      localStorage.removeItem('likedPosts')
      this.updateProfileStatus()
      handleNavigation('/html/Log-in.html')
    })

    backIcon?.addEventListener('click', () => window.history.back())
  }

  getElements() {
    const getElement = (id) => this.shadowRoot.getElementById(id)
    return {
      headerText: getElement('header-text'),
      profileImg: getElement('profile-img'),
      profileDropdown: getElement('profile-dropdown'),
      dropdownEditProfile: getElement('dropdown-edit-profile'),
      dropdownEditPassword: getElement('dropdown-edit-password'),
      dropdownLogin: getElement('dropdown-login'),
      dropdownLogout: getElement('dropdown-logout'),
      backIcon: getElement('header-back'),
      profileWrap: getElement('profile-wrap'),
      headerWrap: getElement('header-wrap'),
    }
  }

  updateProfileStatus() {
    const dropdownEditProfile = this.shadowRoot.getElementById(
      'dropdown-edit-profile',
    )
    const dropdownEditPassword = this.shadowRoot.getElementById(
      'dropdown-edit-password',
    )
    const dropdownLogin = this.shadowRoot.getElementById('dropdown-login')
    const dropdownLogout = this.shadowRoot.getElementById('dropdown-logout')

    dropdownEditProfile.style.display = this.user ? 'block' : 'none'
    dropdownEditPassword.style.display = this.user ? 'block' : 'none'
    dropdownLogin.style.display = this.user ? 'none' : 'block'
    dropdownLogout.style.display = this.user ? 'block' : 'none'
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
      headerWrap.style.justifyContent = 'start'
      headerWrap.style.paddingLeft = '0px'
      headerWrap.style.gap = '193px'
    } else if (
      currentPath === '/html/Posts.html' ||
      currentPath === '/html/edit-profile.html' ||
      currentPath === '/html/edit-password.html'
    ) {
      backIcon.style.display = 'none'
    } else {
      headerWrap.style.paddingLeft = '0px'
    }
  }
}

customElements.define('header-element', headerElement)
