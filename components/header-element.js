import handleNavigation from '/utils/navigation.js'
import { logoutUser } from '/services/user-api.js'
import { getSessionUser } from '/services/user-api.js'

class headerElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.user = null
    this.loadingPromise = null // 로딩 상태 관리
  }

  async connectedCallback() {
    // 로딩 상태 Promise 저장
    this.loadingPromise = this.fetchData()

    // 스타일 로드
    const styleSheet = document.createElement('link')
    styleSheet.rel = 'stylesheet'
    styleSheet.href = '/styles/global.css'
    this.shadowRoot.appendChild(styleSheet)

    // 스타일 로드 후 템플릿 렌더링
    styleSheet.addEventListener('load', async () => {
      await this.loadingPromise // 데이터 로드 대기
      this.shadowRoot.innerHTML += this.template()
      this.initializeComponent()
      this.initializeTheme() // 테마 초기화
    })
  }

  // 테마 초기화 메서드
  initializeTheme() {
    const themeSwitch = this.shadowRoot.getElementById('theme-switch')
    const body = document.body

    // 초기 상태 설정 (로컬스토리지 기반)
    if (localStorage.getItem('theme') === 'dark') {
      body.classList.add('dark-mode')
      themeSwitch.checked = true
    }

    // 슬라이더 상태 변경 이벤트
    themeSwitch.addEventListener('change', () => {
      if (themeSwitch.checked) {
        body.classList.add('dark-mode')
        localStorage.setItem('theme', 'dark')
      } else {
        body.classList.remove('dark-mode')
        localStorage.setItem('theme', 'light')
      }
    })
  }

  // 데이터를 패치하고 Promise 반환
  async fetchData() {
    this.user = await getSessionUser() // 사용자 데이터 패치
    return Promise.resolve()
  }

  template() {
    return `
    <header>
      <div id="header-wrap" class="header-wrap">
        <p id="header-text" class="header-text">
          Hazel Forum
        </p>
        <div class="wrap-for-flex">
          <div class="theme-toggle">
            <i class="fa-solid fa-sun"></i>
            <input type="checkbox" id="theme-switch" />
            <label for="theme-switch" class="slider"></label>
            <i class="fa-solid fa-moon"></i>
          </div>
          <div id="profile-wrap" class="profile-wrap">
            <img
              id="profile-img"
              alt="profile-img"
              class="header-profile-img"
              loading="lazy"
            />
            <div id="profile-dropdown" class="profile-dropdown">
              <div id="dropdown-edit-profile" class="profile-dropdown-menu">
                Edit profile
              </div>
              <div id="dropdown-edit-password" class="profile-dropdown-menu">
                Edit pw
              </div>
              <div id="dropdown-login" class="profile-dropdown-menu">
                Log in
              </div>
              <div id="dropdown-logout" class="profile-dropdown-menu">
                Log out
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>`
  }

  initializeComponent() {
    const profileImg = this.shadowRoot.getElementById('profile-img')
    profileImg.src = this.user?.profile_picture || '/assets/pre-profile.png'

    this.addEventListener()
    this.updateProfileStatus()
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

  getLoadingPromise() {
    return this.loadingPromise
  }
}

customElements.define('header-element', headerElement)
