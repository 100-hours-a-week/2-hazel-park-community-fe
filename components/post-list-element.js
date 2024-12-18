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
  }

  async connectedCallback() {
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

    // 데이터 로드
    await this.loadPostsData()

    // 무한 스크롤 초기화
    this.initInfiniteScroll()
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
              <div class="post-likes">좋아요 ${checkCount(post.likes)}</div>
              <div class="post-comment">댓글 ${checkCount(post.comments)}</div>
              <div class="post-views">조회수 ${checkCount(post.views)}</div>
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
              : `<div id="post-writer-div" class="post-writer-img"></div>`
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

  showLoadingAnimation() {
    const loaderContainer = document.createElement('div')
    loaderContainer.classList.add('loading-animation')

    const lottieHtml = `
      <dotlottie-player
        src="https://lottie.host/c956f1a0-cebe-4833-9fc2-fa838c2c1731/zJVQAx5Siv.json"
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
