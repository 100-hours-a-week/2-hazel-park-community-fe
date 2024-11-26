import checkCount from '/utils/check-count.js'
import handleNavigation from '/utils/navigation.js'
import { getPosts } from '/services/post-api.js'
import { formatCommentDate } from '/utils/format-date.js'

class PostListElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.posts = []
    this.page = 0
    this.allPostsLoaded = false
  }

  async connectedCallback() {
    if (!document.querySelector('script[src*="dotlottie-player"]')) {
      const script = document.createElement('script')
      script.src =
        'https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs'
      script.type = 'module'
      document.head.appendChild(script)
    }

    await this.render()

    window.scrollTo(0, sessionStorage.getItem('scrollPosition') || 0)

    await this.loadPostsData()
    this.initInfiniteScroll()
  }

  async loadPostsData() {
    if (this.isLoading || this.allPostsLoaded) return

    try {
      this.isLoading = true
      let newPosts

      if (this.page === 0) {
        newPosts = await getPosts({ page: this.page, limit: 4 })
        console.log(newPosts)
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

      this.render()

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

  render() {
    const posts = Array.isArray(this.posts) ? this.posts : [this.posts]
    this.shadowRoot.innerHTML = this.template(posts)

    const postItems = this.shadowRoot.querySelectorAll('.post-item')
    postItems.forEach((item, index) => {
      const postId = posts[index].id
      item.dataset.id = postId
      item.addEventListener('click', () => {
        sessionStorage.setItem('scrollPosition', window.scrollY)
        handleNavigation(`/html/post.html?id=${postId}`)
      })
    })
  }

  initInfiniteScroll() {
    setTimeout(() => {
      const sentinel = this.shadowRoot.querySelector('.scroll-sentinel')
      if (!sentinel) {
        console.error('Scroll sentinel element not found')
        return
      }

      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !this.allPostsLoaded) {
            this.loadPostsData()
          }
        },
        {
          rootMargin: '8px',
          threshold: 0.1,
        },
      )

      this.observer.observe(sentinel)
    }, 100)
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

  template(posts) {
    return `
      <link rel="stylesheet" href="/styles/Posts.css">
      <div class="post-list">
        ${posts
          .map(
            (post) => `
              <div class="post-item">
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
              </div>
            `,
          )
          .join('')}
        </div>
      <div class="scroll-sentinel"></div>
    `
  }
}

customElements.define('post-list-element', PostListElement)
