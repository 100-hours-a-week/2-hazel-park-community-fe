import checkCount from '/utils/check-count.js'
import handleNavigation from '/utils/navigation.js'
import { getSessionUser } from '/services/user-api.js'
import { getPostDetail, deletePost, likes } from '/services/post-api.js'
import { formatDate, formatCommentDate } from '/utils/format-date.js'

class PostElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.user = null
    this.post = null
    this.postId = null
    this.is_liked = false
    this.likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || {}
  }

  async connectedCallback() {
    this.user = await getSessionUser()
    const styleLink = document.createElement('link')
    styleLink.rel = 'stylesheet'
    styleLink.href = '/styles/post.css'
    this.shadowRoot.appendChild(styleLink)
    await this.loadPostData()
    this.loadLikeState()
  }

  loadLikeState() {
    this.is_liked = this.likedPosts[this.postId] === true
  }

  async saveLikeState() {
    if (this.is_liked) {
      this.likedPosts[this.postId] = true
    } else {
      delete this.likedPosts[this.postId]
    }
    localStorage.setItem('likedPosts', JSON.stringify(this.likedPosts))
  }

  async updateLikes() {
    if (!this.user) {
      alert('로그인 후 이용할 수 있습니다.')
      handleNavigation('/html/Log-in.html')
      return
    }

    try {
      this.is_liked = !this.is_liked

      this.post.post_likes += this.is_liked ? 1 : -1
      this.updateLikesUI()

      const updatedLikes = await likes(this.postId, this.is_liked)

      this.post.post_likes = updatedLikes
      await this.saveLikeState()
      this.updateLikesUI()
    } catch (error) {
      this.is_liked = !this.is_liked
      this.post.post_likes += this.is_liked ? 1 : -1
      this.updateLikesUI()
    }
  }

  updateLikesUI() {
    const likesElement = this.shadowRoot.getElementById(
      'post-interaction-likes',
    )
    if (!likesElement) return

    const likesValueElement = likesElement.querySelector(
      '.post-interaction-value',
    )
    if (likesValueElement) {
      likesValueElement.textContent = checkCount(this.post.post_likes)
    }

    likesElement.style.backgroundColor = this.is_liked ? '#e9e9e9' : '#d9d9d9'
  }

  addEventListeners() {
    const deletePostButton = this.shadowRoot.getElementById('button-delete')
    const updatePostButton = this.shadowRoot.getElementById('button-update')
    const likesButton = this.shadowRoot.getElementById('post-interaction-likes')

    if (!this.user || this.user.nickname !== this.post.post_writer) {
      deletePostButton.style.visibility = 'hidden'
      updatePostButton.style.visibility = 'hidden'
    }

    deletePostButton?.addEventListener('click', () => {
      this.openModal()
    })

    updatePostButton?.addEventListener('click', () => {
      if (this.user.nickname !== this.post.post_writer) {
        this.openModal()
      }
      this.navigateToEditPage()
    })

    likesButton?.addEventListener('click', async () => {
      await this.updateLikes()
    })
  }

  openModal() {
    const modalBackground = document.createElement('div')
    modalBackground.classList.add('modal-background')

    const modal = document.createElement('modal-element')
    modal.setAttribute('title-text', '게시글을 삭제하시겠습니까?')
    modal.setAttribute('description-text', '삭제한 내용은 복구할 수 없습니다.')

    document.body.appendChild(modalBackground)
    document.body.appendChild(modal)

    modal.onConfirm = () => this.deleteConfirm()
    modalBackground.addEventListener('click', () => this.closeModal())
  }

  navigateToEditPage() {
    const postId = this.post.post_id
    handleNavigation(`/html/edit-post.html?id=${postId}`)
  }

  async loadPostData() {
    const urlParams = new URLSearchParams(window.location.search)
    const postId = Number(urlParams.get('id'))
    this.post = await getPostDetail(postId)
    this.postId = postId
    this.renderPost()
  }

  async deleteConfirm() {
    await deletePost(this.postId)
    handleNavigation('/html/Posts.html')
  }

  renderPost() {
    const postContainer = document.createElement('div')
    postContainer.className = 'post'

    postContainer.innerHTML = `
      <div class="post-detail-top">
        <div class="post-title">${this.post.post_title}</div>
        <div class="post-title-detail-wrap">
          ${
            this.post.author_profile_picture
              ? `<img id="post-writer-img" src="${this.post.author_profile_picture}" class="post-writer-profile" />`
              : `<div id="post-writer-div" class="post-writer-img"></div>`
          }
          <div class="post-writer-name">${this.post.post_writer}</div>
          <div class="post-updateAt">${formatCommentDate(this.post.post_updated_at)}</div>
          <div class="post-controll-button">
            <button id="button-update" class="post-controll-button-detail">수정</button>
            <button id="button-delete" class="post-controll-button-detail">삭제</button>
          </div>
        </div>
      </div>
      <div class="post-detail-bottom">
        ${
          this.post.post_img
            ? `<img src="${this.post.post_img}" class="post-img" />`
            : ''
        }
        <div class="post-contents">${this.post.post_contents}</div>
        <div class="post-interaction">
          <div id="post-interaction-likes" class="post-interaction-box">
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
      </div>
    `

    this.shadowRoot.appendChild(postContainer)

    postContainer.classList.add('visible')

    this.addEventListeners()
  }
}

customElements.define('post-element', PostElement)
