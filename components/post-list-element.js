import checkCount from '/utils/check-count.js'
import handleNavigation from '/utils/navigation.js'
import { getPosts } from '/services/post-api.js'
import { formatDate, formatCommentDate } from '/utils/format-date.js'

class PostListElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.posts = []
    this.page = 0
    this.allPostsLoaded = false
    this.isLoading = false
    this.loadingPromise = null // 로딩 상태 관리
  }

  async connectedCallback() {
    // 로딩 상태 Promise 저장
    this.loadingPromise = this.fetchData()

    const savedScrollPosition = sessionStorage.getItem('scrollPosition')
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition, 10))
    }

    if (!document.querySelector('script[src*="dotlottie-player"]')) {
      const script = document.createElement('script')
      script.src =
        'https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs'
      script.type = 'module'
      script.async = true
      document.head.appendChild(script)
    }

    // 외부 스타일 추가
    const styleLink = document.createElement('link')
    styleLink.rel = 'stylesheet'
    styleLink.href = '/styles/Posts.css'
    this.shadowRoot.appendChild(styleLink)

    // 스타일 로드 대기
    await this.waitForStylesLoaded()

    // 초기 DOM 렌더링
    const postList = document.createElement('div')
    postList.className = 'post-list'
    this.shadowRoot.appendChild(postList)

    // 데이터 로드 완료 후 초기화
    await this.loadingPromise // 데이터 로드 대기

    const sheet = new CSSStyleSheet()
    sheet.replaceSync(`
      .post-item {
        background-color: var(--post-item-bg, #ffffff);
        color: var(--post-item-color, #000000);
        box-shadow: 0 2px 4px var(--post-item-shadow, rgba(0, 0, 0, 0.1)); 
      }
    
      .post-item:hover {
        box-shadow: 3px 4px 4px 0px var(--post-item-hover-shadow, #cccccc40);
        transform: translateY(-5px);
      }
    
      .post-wrap-detail {
        display: flex;
        flex-direction: row;
        gap: 10px;
        color: var(--post-detail-color, rgb(107, 107, 107));
      }

      .post-updateAt {
        margin-left: auto;
        align-self: end;
        text-wrap: nowrap;
        color: var(--post-detail-color, rgb(107, 107, 107));
      }

      .post-info-wrap {
        display: flex;
        justify-content: space-between;
        padding: 0 1.5em 1.5em 1.5em;
        font-weight: 400;
        font-size: 0.875rem;
        line-height: 1.1375rem;
        border-bottom: 1px solid var(--post-border-color, #D1D1D6);
      }
    `)
    this.shadowRoot.adoptedStyleSheets = [sheet]

    // CSS 변수 업데이트를 위한 MutationObserver 설정
    this.setupThemeObserver()

    this.initInfiniteScroll()
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
    this.shadowRoot.host.style.setProperty(
      '--post-item-bg',
      isDarkMode ? '#1C1C1E' : '#ffffff',
    )
    this.shadowRoot.host.style.setProperty(
      '--post-item-color',
      isDarkMode ? '#ffffff' : '#000000',
    )
    this.shadowRoot.host.style.setProperty(
      '--post-item-shadow',
      isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    )
    this.shadowRoot.host.style.setProperty(
      '--post-item-hover-shadow',
      isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#cccccc40',
    )
    this.shadowRoot.host.style.setProperty(
      '--post-detail-color',
      isDarkMode ? '#ebebf5' : 'rgb(107, 107, 107)',
    )
    this.shadowRoot.host.style.setProperty(
      '--post-border-color',
      isDarkMode ? '#48484a' : '#D1D1D6',
    )
  }

  waitForStylesLoaded() {
    return new Promise((resolve) => {
      const stylesheet = this.shadowRoot.querySelector('link[rel="stylesheet"]')

      if (!stylesheet) {
        resolve()
        return
      }

      stylesheet.addEventListener('load', () => resolve())
      stylesheet.addEventListener('error', () => resolve()) // 에러 시에도 진행
    })
  }

  async fetchData() {
    // 데이터를 로드하고 Promise 반환
    await this.loadPostsData()
    return Promise.resolve()
  }

  async loadPostsData() {
    if (this.isLoading || this.allPostsLoaded) return

    try {
      this.isLoading = true
      let newPosts

      if (this.page === 0) {
        newPosts = await getPosts({ page: this.page, limit: 4 })
      } else {
        this.showLoadingAnimation()
        const [postsData] = await Promise.all([
          getPosts({ page: this.page, limit: 4 }),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ])
        newPosts = postsData
      }

      this.posts = [...this.posts, ...newPosts]
      this.page += 1

      this.renderPosts()

      if (newPosts.length < 4) {
        this.allPostsLoaded = true
        this.stopInfiniteScroll()
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      this.isLoading = false
      this.hideLoadingAnimation()
    }
  }

  renderPosts() {
    const postList = this.shadowRoot.querySelector('.post-list')
    postList.innerHTML = ''

    this.posts.forEach((post) => {
      const postItem = document.createElement('div')
      postItem.classList.add('post-item')

      postItem.innerHTML = `
        <div class="post-info-wrap">
          <div class="post-info-wrap-left">
            <div class="post-title">${post.title}</div>
            <div class="post-wrap-detail">
              <div class="post-likes">
                <i class="fa-solid fa-heart"></i>
                ${checkCount(post.likes)}
              </div>
              <div class="post-comment">
                <i class="fa-solid fa-comment"></i>
                ${checkCount(post.comments)}
              </div>
              <div class="post-views">
                <i class="fa-solid fa-eye"></i>
               ${checkCount(post.views)}
              </div>
            </div>
          </div>
          <div class="post-updateAt">
            ${post.updated_at ? formatCommentDate(post.updated_at) : '날짜 정보 없음'}
          </div>
        </div>
        <div class="post-writer-wrap">
          ${
            post.img
              ? `<img id="post-writer-img" src="${post.img}" class="post-writer-profile" />`
              : `<img id="post-writer-div" class="post-writer-img" src='/assets/pre-profile.png' />`
          }
          <div class="post-writer">${post.writer}</div>
        </div>
      `

      postItem.addEventListener('click', () => {
        sessionStorage.setItem('scrollPosition', window.scrollY)
        handleNavigation(`/html/post.html?id=${post.id}`)
      })

      postList.appendChild(postItem)
    })

    postList.classList.add('visible')

    if (!this.allPostsLoaded) {
      if (this.observer) {
        this.observer.disconnect()
      }
      this.initInfiniteScroll()
    }
  }

  initInfiniteScroll() {
    const sentinel = this.shadowRoot.querySelector('.scroll-sentinel')

    if (!sentinel) {
      const sentinelDiv = document.createElement('div')
      sentinelDiv.className = 'scroll-sentinel'
      this.shadowRoot.querySelector('.post-list').appendChild(sentinelDiv)
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !this.allPostsLoaded &&
          !this.isLoading
        ) {
          this.loadPostsData()
        }
      },
      {
        root: null,
        rootMargin: '8px',
        threshold: 0.1,
      },
    )

    this.observer.observe(this.shadowRoot.querySelector('.scroll-sentinel'))
  }

  stopInfiniteScroll() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }

  // 외부에서 호출 가능한 로딩 상태 반환 메서드
  getLoadingPromise() {
    return this.loadingPromise
  }

  showLoadingAnimation() {
    const loaderContainer = document.createElement('div')
    loaderContainer.classList.add('loading-animation')

    const lottieHtml = `
      <dotlottie-player
        src="https://lottie.host/7aabca84-399a-4a9d-98e6-4adf8833b9da/Mym1EA2Izc.lottie"
        background="transparent"
        speed="1"
        style="width: 4.167vw; height: 7.407vh"
        direction="1"
        playMode="normal"
        loop
        autoplay
      ></dotlottie-player>
    `
    loaderContainer.innerHTML = lottieHtml

    this.shadowRoot.appendChild(loaderContainer)
  }

  hideLoadingAnimation() {
    const loaderContainer = this.shadowRoot.querySelector('.loading-animation')
    if (loaderContainer) {
      loaderContainer.remove()
    }
  }
}

customElements.define('post-list-element', PostListElement)
