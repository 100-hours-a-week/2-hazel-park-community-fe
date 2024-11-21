import checkCount from '../utils/check-count.js'
import handleNavigation from '../utils/navigation.js'
import { getPostDetail, deletePost, likes } from '../services/post-api.js'
import { formatDate } from '../utils/format-date.js'

class PostElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.storedData = JSON.parse(localStorage.getItem('user'))
    this.isLogin = JSON.parse(localStorage.getItem('isLogin')) || false
    this.post = null
    this.postId = null
    this.is_liked = false
    this.likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || {}
  }

  async connectedCallback() {
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
    if (!this.isLogin) {
      alert('로그인 후 이용할 수 있습니다.')
      return
    }

    try {
      this.is_liked = !this.is_liked

      this.post.post_likes += this.is_liked ? 1 : -1
      this.renderPost()

      const updatedLikes = await likes(this.postId, this.is_liked)

      this.post.post_likes = updatedLikes
      await this.saveLikeState()
      this.renderPost()
    } catch (error) {
      console.error('Failed to update likes:', error)
      this.is_liked = !this.is_liked
      this.post.post_likes += this.is_liked ? 1 : -1
      this.renderPost()
    }
  }

  updateLikesUI() {
    const likesElement = this.shadowRoot.getElementById(
      'post-interaction-likes',
    )
    if (likesElement && this.likedPosts[this.postId]) {
      likesElement.style.backgroundColor = '#e9e9e9'
    }
  }

  template() {
    const {
      post_title,
      post_writer,
      post_updated_at,
      post_contents,
      post_likes,
      post_views,
      post_comments,
      author_profile_picture,
      post_img,
    } = this.post
    return `
      <link rel="stylesheet" href="../styles/post.css" />
      <section class="post">
          <article class="post-detail-top">
            <div class="post-title">${post_title}</div>
            <div class="post-title-detail-wrap">
            ${
              author_profile_picture
                ? `
                    <img id="post-writer-img" src="${author_profile_picture}" class="post-writer-profile" />
                  `
                : `
                    <div id="post-writer-div" class="post-writer-img"></div>
                  `
            }
              <div class="post-writer-name">${post_writer}</div>
              <div class="post-updateAt">${formatDate(post_updated_at)}</div>
              <div class="post-controll-button">
                <button id="button-update" class="post-controll-button-detail">수정</button>
                <button id="button-delete" class="post-controll-button-detail">삭제</button>
              </div>
            </div>
          </article>
          <article class="post-detail-bottom">
          ${
            post_img
              ? `
                  <img src="${post_img}" class="post-img" />
                `
              : `
                `
          }
            
            <div class="post-contents">${post_contents}</div>
            <div class="post-interaction">
              <div id="post-interaction-likes" class="post-interaction-box">
                <div class="post-interaction-value">${checkCount(post_likes)}</div>
                <div class="post-interaction-title">좋아요</div>
              </div>
              <div class="post-interaction-box">
                <div class="post-interaction-value">${checkCount(post_views)}</div>
                <div class="post-interaction-title">조회수</div>
              </div>
              <div class="post-interaction-box">
                <div class="post-interaction-value">${checkCount(post_comments)}</div>
                <div class="post-interaction-title">댓글</div>
              </div>
            </div>
          </article>
      </section>
    `
  }

  addEventListener() {
    const deletePost = this.shadowRoot.getElementById('button-delete')
    const updatePost = this.shadowRoot.getElementById('button-update')
    const likes = this.shadowRoot.getElementById('post-interaction-likes')

    deletePost?.addEventListener('click', () => {
      if (!this.isLogin || this.storedData.nickname !== this.post.post_writer) {
        alert('게시글 작성자만 이용할 수 있는 기능입니다.')
        return
      } else {
        this.openModal()
      }
    })
    updatePost?.addEventListener('click', () => {
      if (!this.isLogin || this.storedData.nickname !== this.post.post_writer) {
        alert('게시글 작성자만 이용할 수 있는 기능입니다.')
        return
      } else {
        this.openModal()
      }
      this.navigateToEditPage()
    })
    likes?.addEventListener('click', async () => this.updateLikes())
  }

  openModal() {
    const modalBackground = document.createElement('div')
    modalBackground.classList.add('modal-background')

    const modal = document.createElement('modal-element')
    modal.setAttribute('title-text', '게시글을 삭제하시겠습니까?')
    modal.setAttribute('description-text', '삭제한 내용은 복구할 수 없습니다.')

    document.body.appendChild(modalBackground)
    document.body.appendChild(modal)

    modal.onConfirm = () => this.deleteContirm()
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

  async deleteContirm() {
    await deletePost(this.postId)
    handleNavigation('/html/Posts.html')
  }

  renderPost() {
    this.shadowRoot.innerHTML = this.template()
    this.addEventListener()
    this.updateLikesUI()
  }
}

customElements.define('post-element', PostElement)
