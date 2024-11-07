import checkCount from '../utils/check-count.js'
import handleNavigation from '../utils/navigation.js'
import { getPostDetail, deletePost, likes } from '../services/post-api.js'

class PostElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.post = null
    this.postId = null
    this.isLiked = false
  }

  async connectedCallback() {
    await this.loadPostData()
    this.loadLikeState()
  }

  loadLikeState() {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || {}
    this.isLiked = likedPosts[this.postId] === true
  }

  saveLikeState() {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || {}
    if (this.isLiked) {
      likedPosts[this.postId] = true
    } else {
      delete likedPosts[this.postId]
    }
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts))
  }

  async updateLikes() {
    const isLogin = JSON.parse(localStorage.getItem('isLogin')) || false
    if (!isLogin) {
      alert('로그인 후 좋아요를 누를 수 있습니다.')
      return
    }

    this.isLiked = !this.isLiked
    const updatedLikes = await likes(this.postId, this.isLiked)
    this.post.post_likes = updatedLikes
    this.saveLikeState()
    this.renderPost()
  }

  template() {
    const {
      post_title,
      post_writer,
      post_updatedAt,
      post_contents,
      post_likes,
      post_views,
      post_comments,
      author_profile_picture,
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
              <div class="post-updateAt">${post_updatedAt}</div>
              <div class="post-controll-button">
                <button id="button-update" class="post-controll-button-detail">수정</button>
                <button id="button-delete" class="post-controll-button-detail">삭제</button>
              </div>
            </div>
          </article>
          <article class="post-detail-bottom">
            <div class="post-contents-img"></div>
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

    deletePost?.addEventListener('click', () => this.openModal())
    updatePost?.addEventListener('click', () => this.navigateToEditPage())
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
    deletePost(this.postId)
    handleNavigation('/html/Posts.html')
  }

  renderPost() {
    this.shadowRoot.innerHTML = this.template()
    this.addEventListener()
  }
}

customElements.define('post-element', PostElement)
