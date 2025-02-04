import handleNavigation from '/utils/navigation.js'
import { getSessionUser, logoutUser, search } from '/services/user-api.js'

class headerElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.user = null
    this.loadingPromise = null // 로딩 상태 관리
  }

  async connectedCallback() {
    // 스타일과 데이터를 병렬로 로드
    await Promise.all([this.loadStyles(), this.fetchData()])

    // 템플릿 렌더링
    this.shadowRoot.innerHTML += this.template()
    this.initializeComponent()
    this.initializeTheme()
  }

  async loadStyles() {
    const styleSheet = document.createElement('link')
    styleSheet.rel = 'stylesheet'
    styleSheet.href = '/styles/global.css'
    const styleSheet2 = document.createElement('link')
    styleSheet2.rel = 'stylesheet'
    styleSheet2.href = '/styles/Posts.css'
    this.shadowRoot.appendChild(styleSheet)
    this.shadowRoot.appendChild(styleSheet2)

    const sheet = new CSSStyleSheet()
    sheet.replaceSync(`
      header {
        background-color: var(--header-bg, #ffffff);
        border-bottom: 1px solid var(--header-border-bottom, #48484a);
      }

      .profile-dropdown {
        position: absolute;
        width: 7.1875rem;
        margin-top: 0.278vh;
        top: 36px;
        right: 0;
        display: flex;
        flex-direction: column;
        background-color: rgb(255, 255, 255);
        border-radius: 4px;
        font-weight: 400;
        font-size: 0.75rem;
        line-heihgt: 0.9075rem;
        text-wrap: nowrap;
        visibility: hidden;
        z-index: 1;
        box-shadow:
          var(--dropdown-shadow-1) 0px 0px 4px,
          var(--dropdown-shadow-2) 0px 2px 8px;
      }

      .profile-dropdown-menu {
        padding-top: 0.625rem;
        padding-bottom: 0.625rem;
        padding-right: 1.5rem;
        padding-left: 1.5rem;
        background-color: var(--dropdown-menu-bg);
        cursor: pointer;
        transition: background-color 0.3s ease;
        color: var(--dropdown-menu-color);
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        display: flex;
        align-items: center;
      }
      
      .profile-dropdown-menu:hover {
        background-color: var(--dropdown-menu-hover-bg);
      }

      .search-dropdown {
        position: absolute;
        width: 240px;
        margin-top: 0.278vh;
        top: 44px;
        left: 167.26px;
        display: flex;
        flex-direction: column;
        background-color: rgb(255, 255, 255);
        border-radius: 4px;
        font-weight: 400;
        font-size: 0.75rem;
        line-heihgt: 0.9075rem;
        text-wrap: nowrap;
        visibility: hidden;
        z-index: 1;
        box-shadow:
          var(--dropdown-shadow-1) 0px 0px 4px,
          var(--dropdown-shadow-2) 0px 2px 8px;        
      }

      .search-box {
        padding: 4px 16px 4px 16px;
        width: 240px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-radius: 20px;
        background-color: var(--search-box-bg);
        justify-content: space-between;
      }

      .search-icon {
        -webkit-text-stroke: 0.05px;
        color: var(--search-icon-color);
        cursor: pointer;
      }

      .profile-dropdown-menu-box {
        padding-top: 0.625rem;
        padding-bottom: 0.625rem;
        padding-right: 1.5rem;
        padding-left: 1.5rem;
        background-color: var(--dropdown-menu-bg);
        cursor: pointer;
        transition: background-color 0.3s ease;
        color: var(--dropdown-menu-color);
        display: flex;
        align-items: center;
      }

      .dropdown-header {
        color: var(--dropdown-header-color)
      }

      .no-results {
        padding-top: 0.625rem;
        padding-bottom: 0.625rem;
        padding-right: 1.5rem;
        padding-left: 1.5rem;
        background-color: var(--dropdown-menu-bg);
        transition: background-color 0.3s ease;
        color: var(--dropdown-menu-color)
      }
    `)
    this.shadowRoot.adoptedStyleSheets = [sheet]

    this.setupThemeObserver()
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

    host.style.setProperty('--header-bg', isDarkMode ? '#000000' : '#ffffff')
    host.style.setProperty(
      '--header-border-bottom',
      isDarkMode ? '#48484a' : '#d1d1d6',
    )

    host.style.setProperty(
      '--dropdown-shadow-1',
      isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    )
    host.style.setProperty(
      '--dropdown-shadow-2',
      isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    )

    host.style.setProperty(
      '--dropdown-menu-bg',
      isDarkMode ? '#141414' : 'transparent',
    )
    host.style.setProperty(
      '--dropdown-menu-color',
      isDarkMode ? '#ffffff' : 'inherit',
    )
    host.style.setProperty(
      '--dropdown-menu-hover-bg',
      isDarkMode ? 'rgb(48, 48, 48)' : 'rgba(0, 0, 0, 0.05)',
    )

    host.style.setProperty(
      '--search-box-bg',
      isDarkMode ? '#1c1c1e' : '#efefef',
    )

    host.style.setProperty(
      '--search-icon-color',
      isDarkMode ? '#ebebf5' : '#6b6b6b',
    )

    host.style.setProperty(
      '--dropdown-header-color',
      isDarkMode ? '#ebebf5' : '#6b6b6b',
    )
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
        document.documentElement.classList.add('dark-mode')
        body.classList.add('dark-mode')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark-mode')
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
        <div class="search-wrap">
          <p id="header-text" class="header-text">
            Hazel Forum
          </p>
          <div class="search-box">
            <input id="search-input" type="text" class="search-input"/>
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
          </div>
          <div id="search-dropdown" class="search-dropdown">
            <div id="dropdown-people" class="profile-dropdown-menu-box" style="display: none">
            </div>
            <div id="dropdown-title" class="profile-dropdown-menu-box" style="display: none">
            </div>
            <div id="dropdown-write" class="profile-dropdown-menu">
              글 쓰러 가기
            </div>
          </div>
        </div>
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
      searchInput,
      searchDropdown,
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
      searchDropdown.style.visibility = 'hidden'
      if (profileImg && !profileImg.contains(event.target)) {
        profileDropdown.style.visibility = 'hidden'
      }
    })

    searchInput?.addEventListener('click', (event) => {
      event.stopPropagation()
      searchDropdown.style.visibility =
        searchDropdown.style.visibility === 'visible' ? 'hidden' : 'visible'
    })

    searchInput?.addEventListener(
      'input',
      debounce(
        () => this.searchKeyword(this.escapeHtml(searchInput.value.trim())),
        300,
      ),
    )

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
      searchInput: getElement('search-input'),
      searchDropdown: getElement('search-dropdown'),
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

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  async searchKeyword(keyword) {
    console.log('검색 키워드:', keyword)

    // 검색어가 없으면 dropdown 숨기기
    const searchDropdown = this.shadowRoot.getElementById('search-dropdown')
    if (!keyword) {
      searchDropdown.style.visibility = 'hidden'
      return
    }

    try {
      const result = await search(keyword)

      const noResultsMsg = searchDropdown.querySelector('.no-results')
      if (noResultsMsg) {
        noResultsMsg.remove()
      }

      if (!result || !result.results || result.results.length === 0) {
        this.renderSearchResults([], [])
        return
      }

      const users = result.results.filter((item) => item.type === 'user')
      const posts = result.results.filter((item) => item.type === 'post')

      this.renderSearchResults(users, posts)
    } catch (error) {
      console.error('검색 오류:', error)
    }
  }

  renderSearchResults(users, posts) {
    const searchDropdown = this.shadowRoot.getElementById('search-dropdown')

    let dropdownPeople = this.shadowRoot.getElementById('dropdown-people')
    let dropdownTitle = this.shadowRoot.getElementById('dropdown-title')
    let dropdownWrite = this.shadowRoot.getElementById('dropdown-write')

    if (!dropdownPeople) {
      dropdownPeople = document.createElement('div')
      dropdownPeople.id = 'dropdown-people'
      dropdownPeople.classList.add('profile-dropdown-menu-box')
      searchDropdown.appendChild(dropdownPeople)
    }

    if (!dropdownTitle) {
      dropdownTitle = document.createElement('div')
      dropdownTitle.id = 'dropdown-title'
      dropdownTitle.classList.add('profile-dropdown-menu-box')
      searchDropdown.appendChild(dropdownTitle)
    }

    if (!dropdownWrite) {
      dropdownWrite = document.createElement('div')
      dropdownWrite.id = 'dropdown-write'
      dropdownWrite.classList.add('profile-dropdown-menu')
      dropdownWrite.textContent = '글 쓰러 가기'

      dropdownWrite.addEventListener('click', (event) => {
        console.log('왜 이동이 안 될가')
        event.stopPropagation() // 드롭다운이 먼저 사라지는 문제 방지
        handleNavigation('/html/make-post.html')
        searchDropdown.style.visibility = 'hidden' // 페이지 이동 후 드롭다운 숨기기
      })
    }

    if (
      !searchDropdown ||
      !dropdownPeople ||
      !dropdownTitle ||
      !dropdownWrite
    ) {
      console.error('검색 결과를 표시할 DOM 요소를 찾을 수 없습니다.')
      return
    }

    // 기존 검색 결과 초기화
    dropdownPeople.innerHTML = '<div class="dropdown-header">People</div>'
    dropdownTitle.innerHTML = '<div class="dropdown-header">Title</div>'

    if (users.length === 0 && posts.length === 0) {
      searchDropdown.innerHTML = '<div class="no-results">검색 결과 없음</div>'
      searchDropdown.appendChild(dropdownWrite)
      searchDropdown.style.visibility = 'visible'
      return
    }

    // 유저 검색 결과
    if (users.length > 0) {
      dropdownPeople.style.display = 'block'
      users.forEach((user) => {
        const userItem = document.createElement('div')
        userItem.classList.add('profile-dropdown-menu')
        userItem.style.gap = '8px'

        const userImg = document.createElement('img')
        userImg.src = user.img || '/assets/pre-profile.png'
        userImg.alt = `${user.name}의 프로필 이미지`
        userImg.classList.add('post-writer-profile')

        const userName = document.createElement('div')
        userName.textContent = `${user.name}`

        userItem.appendChild(userImg)
        userItem.appendChild(userName)

        // userItem.addEventListener('click', () =>
        //   handleNavigation(`넣을까말까넣을까말까`),
        // )

        dropdownPeople.appendChild(userItem)
      })
    } else {
      dropdownPeople.style.display = 'none'
    }

    // 게시글 검색 결과
    if (posts.length > 0) {
      dropdownTitle.style.display = 'block'
      posts.forEach((post) => {
        const postItem = document.createElement('div')
        postItem.classList.add('profile-dropdown-menu')
        postItem.textContent = post.name
        postItem.addEventListener('click', () =>
          handleNavigation(`/html/post.html?id=${post.id}`),
        )
        dropdownTitle.appendChild(postItem)
      })
    } else {
      dropdownTitle.style.display = 'none'
    }

    searchDropdown.appendChild(dropdownWrite)

    searchDropdown.style.visibility = 'visible'
  }
}

function debounce(func, delay) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => func.apply(this, args), delay)
  }
}

customElements.define('header-element', headerElement)
