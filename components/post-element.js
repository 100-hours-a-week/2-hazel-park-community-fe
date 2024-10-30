import checkCount from '../utils/check-count.js'
import handleNavigation from '../utils/navigation.js'

class PostElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.post = null
  }

  connectedCallback() {
    this.loadPostData()
  }

  template() {
    return `
        <link rel="stylesheet" href="../styles/post.css" />
        <section class="post">
            <article class="post-detail-top">
              <div class="post-title">${this.post.post_title}</div>
              <div class="post-title-detail-wrap">
                <div class="post-writer-img"></div>
                <div class="post-writer-name">${this.post.post_writer}</div>
                <div class="post-updateAt">${this.post.post_updatedAt}</div>
                <div class="post-controll-button">
                  <button id="button-update" class="post-controll-button-detail">
                    수정
                  </button>
                  <button id="button-delete" class="post-controll-button-detail">
                    삭제
                  </button>
                </div>
              </div>
            </article>
            <article class="post-detail-bottom">
              <div class="post-contents-img"></div>
              <div class="post-contents">
              ${this.post.post_contents}
              </div>
              <div class="post-interaction">
                <div class="post-interaction-box">
                  <div class="post-interaction-value">${checkCount(this.post.post_likes)}</div>
                  <div class="post-interaction-title">좋아요</div>
                </div>
                <div class="post-interaction-box">
                  <div class="post-interaction-value">${checkCount(this.post.post_views)}</div>
                  <div class="post-interaction-title">조회수</div>
                </div>
                <div class="post-interaction-box">
                  <div class="post-interaction-value">${checkCount(this.post.post_comments)}</div>
                  <div class="post-interaction-title">댓글</div>
                </div>
              </div>
            </article>
        </section>
    `
  }

  addEventListener() {
    const deletePost = this.shadowRoot.getElementById('button-delete')

    if (deletePost) {
      deletePost.addEventListener('click', () => this.openModal())
    }
  }

  openModal() {
    const modalBackground = document.createElement('div')
    modalBackground.classList.add('modal-background')

    const modal = document.createElement('modal-element')
    modal.setAttribute('title-text', '게시글을 삭제하시겠습니까?')
    modal.setAttribute('description-text', '삭제한 내용은 복구할 수 없습니다.')

    document.body.appendChild(modalBackground)
    document.body.appendChild(modal)

    modal.onConfirm = () => handleNavigation('/html/Posts.html')
    modalBackground.addEventListener('click', () => this.closeModal())
  }

  loadPostData() {
    const urlParams = new URLSearchParams(window.location.search)
    const postId = Number(urlParams.get('id'))

    fetch('../data/posts.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText)
        }
        return response.json()
      })
      .then((allPosts) => {
        this.post = allPosts.find((post) => post.post_id === postId)
        if (!this.post) {
          console.error('해당 ID의 포스트를 찾을 수 없습니다.')
        } else {
          this.renderPost()
        }
      })
      .catch((error) => {
        console.error('Fetch error:', error)
      })
  }

  renderPost() {
    this.shadowRoot.innerHTML = this.template()
    this.addEventListener()
  }
}

customElements.define('post-element', PostElement)
