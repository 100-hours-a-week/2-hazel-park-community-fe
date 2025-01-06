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

    const styleSheet2 = document.createElement('link')
    styleSheet2.rel = 'stylesheet'
    styleSheet2.href = '/styles/global.css'
    this.shadowRoot.appendChild(styleSheet2)

    const sheet = new CSSStyleSheet()
    sheet.replaceSync(`
      .profile-dropdown {
        position: absolute;
        width: 7.1875rem;
        margin-top: 0.278vh;
        right: 0;
        display: flex;
        flex-direction: column;
        background-color: rgb(255, 255, 255);
        color: rgb(107, 107, 107);
        font-weight: 400;
        font-size: 0.75rem;
        line-heihgt: 0.9075rem;
        text-wrap: nowrap;
        visibility: hidden;
        z-index: 1;
        box-shadow:
          rgba(0, 0, 0, 0.05) 0px 0px 4px,
          rgba(0, 0, 0, 0.15) 0px 2px 8px;
      }

      :host-context(body.dark-mode) .profile-dropdown {
        box-shadow:
          rgba(255, 255, 255, 0.05) 0px 0px 4px,
          rgba(255, 255, 255, 0.15) 0px 2px 8px;
      }

      .profile-dropdown-menu {
        padding-top: 0.625rem;
        padding-bottom: 0.625rem;
        padding-right: 1.5rem;
        padding-left: 1.5rem;
        background-color: transparent;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }
    
      :host-context(body.dark-mode) .profile-dropdown-menu {
        background-color: #141414;
        color: #ffffff;
      }
              
      :host-context(body.dark-mode) .profile-dropdown-menu:hover {
        background-color: rgb(48, 48, 48)
      }
    `)
    this.shadowRoot.adoptedStyleSheets = [sheet]

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

    likesElement.style.color = this.is_liked ? '#c94a4a' : 'rgb(107, 107, 107)'
  }

  addEventListeners() {
    const controllButton = this.shadowRoot.getElementById('controll-button')
    const buttonDropdown = this.shadowRoot.getElementById(
      'controll-button-dropdown',
    )
    const deletePostButton = this.shadowRoot.getElementById('button-delete')
    const updatePostButton = this.shadowRoot.getElementById('button-update')
    const likesButton = this.shadowRoot.getElementById('post-interaction-likes')

    if (!this.user || this.user.nickname !== this.post.post_writer) {
      controllButton.style.visibility = 'hidden'
      deletePostButton.style.visibility = 'hidden'
      updatePostButton.style.visibility = 'hidden'
    }

    document.addEventListener('click', (event) => {
      if (controllButton && !controllButton.contains(event.target)) {
        buttonDropdown.style.visibility = 'hidden'
      }
    })

    controllButton?.addEventListener('click', (event) => {
      event.stopPropagation()
      buttonDropdown.style.visibility =
        buttonDropdown.style.visibility === 'visible' ? 'hidden' : 'visible'
    })

    deletePostButton?.addEventListener('click', () => {
      this.openModal()
    })

    updatePostButton?.addEventListener('click', () => {
      if (this.user.nickname !== this.post.post_writer) {
        this.openModal()
      } else {
        this.navigateToEditPage()
      }
    })

    likesButton?.addEventListener('click', async () => {
      await this.updateLikes()
    })
  }

  openModal() {
    if (!this.user || this.user.nickname !== this.post.post_writer) {
      alert('올바르지 않은 접근입니다.')
      handleNavigation(`/html/Posts.html`)
      return
    }

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
              : `<img id="post-writer-div" class="post-writer-img" src='/assets/pre-profile.png' />`
          }
          <div class="wrap-for-gap">
            <div class="post-writer-name">${this.post.post_writer}</div>
            <div class="post-wrap-detail-box">
              <div class="post-updateAt">${formatCommentDate(this.post.post_updated_at)}</div>
              <div>
                <div class="post-wrap-detail">
                  <div class="detail-icon">
                    <i class="fa-solid fa-eye"></i>
                    <div class="icon-value">${checkCount(this.post.post_views)}</div>
                  </div>
                  <div class="detail-icon">
                    <i class="fa-regular fa-comment"></i>
                    <div class="icon-value">${checkCount(this.post.post_comments)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="post-controll-button">
            <i id="controll-button" class="fa-solid fa-ellipsis-vertical" style='color: #6b6b6b; cursor: pointer;'></i>
              <div id="controll-button-dropdown" class="profile-dropdown">
               <div id="button-update" class="profile-dropdown-menu">
                 Edit post
               </div>
               <div id="button-delete" class="profile-dropdown-menu">
                 Delete post
               </div>
            </div>           
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
            <i class="fa-solid fa-heart"></i>
            <div class="post-interaction-value">${checkCount(this.post.post_likes)}</div>
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
