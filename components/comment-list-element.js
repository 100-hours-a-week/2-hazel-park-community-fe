import {
  getComments,
  uploadComment,
  editComments,
  deleteComments,
} from '/services/comment-api.js'
import { formatDate, formatCommentDate } from '/utils/format-date.js'

class CommentListElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.postId = null
    this.storedData = JSON.parse(localStorage.getItem('user'))
    this.isEditing = false
    this.isLogin = JSON.parse(localStorage.getItem('isLogin')) || false
    this.page = 0
    this.allCommentsLoaded = false
    this.COMMENTS_PER_PAGE = 2
    this.comments = []
    this.isLoading = false
    // 댓글 등록 버튼을 비활성화하여 중복 클릭을 방지
    this.isRequestInProgress = false
  }

  async connectedCallback() {
    await this.loadLottieScript()
    const urlParams = new URLSearchParams(window.location.search)
    this.postId = Number(urlParams.get('id'))

    if (!this.postId) {
      console.error('postId를 찾을 수 없습니다.')
      return
    }

    this.shadowRoot.innerHTML = this.template(this.comments)

    await this.loadCommentsData()

    this.initInfiniteScroll()

    this.addEventListener(this.comments)
  }

  async loadLottieScript() {
    if (!document.querySelector('script[src*="dotlottie-player"]')) {
      const script = document.createElement('script')
      script.src =
        'https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs'
      script.type = 'module'
      document.head.appendChild(script)
    }
  }
  async loadCommentsData() {
    if (this.isLoading || this.allCommentsLoaded) return

    try {
      this.isLoading = true
      let newComments
      if (this.page === 0) {
        newComments = await getComments({
          postId: this.postId,
          page: this.page,
          limit: this.COMMENTS_PER_PAGE,
        })
      } else {
        this.showLoadingAnimation()
        const [commentsData] = await Promise.all([
          getComments({
            postId: this.postId,
            page: this.page,
            limit: this.COMMENTS_PER_PAGE,
          }),
          new Promise((resolve) => setTimeout(resolve, 1000)),
        ])
        newComments = commentsData
      }

      if (Array.isArray(newComments)) {
        // 중복된 댓글을 방지하기 위해, 기존 댓글에 없는 댓글만 추가
        this.comments = [
          ...this.comments.filter((existingComment) =>
            newComments.every(
              (newComment) => newComment.id !== existingComment.id,
            ),
          ),
          ...newComments,
        ]
        this.page += 1

        if (newComments.length < this.COMMENTS_PER_PAGE) {
          this.allCommentsLoaded = true
          this.stopInfiniteScroll()
        }

        this.renderComments()
      }
    } catch (error) {
      console.error('댓글을 불러오는 데 실패했습니다:', error)
    } finally {
      this.hideLoadingAnimation()
      this.isLoading = false
    }
  }

  renderComments() {
    this.shadowRoot.innerHTML = this.template(this.comments)
    this.addEventListener(this.comments)
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
          if (
            entries[0].isIntersecting &&
            !this.allCommentsLoaded &&
            !this.isLoading
          ) {
            this.loadCommentsData()
          }
        },
        {
          rootMargin: '10px',
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

  template(comments) {
    return `
      <link rel="stylesheet" href="/styles/global.css">
      <link rel="stylesheet" href="/styles/post.css">
      <div>
        ${comments
          .map(
            (comment) => `
            <div class="comment-wrap">
              <div class="comment-wrap-detail">
                <div class="comment-writer-info">
                ${
                  comment.author_profile_picture
                    ? `
                        <img id="post-writer-img" src="${comment.author_profile_picture}" class="post-writer-profile" />
                      `
                    : `
                        <div id="post-writer-div" class="post-writer-img"></div>
                      `
                }
                  <div class="post-writer-name">${comment.writer}</div>
                  <div class="post-updateAt">${formatCommentDate(comment.updated_at)}</div>
                </div>
                <div class="comment-contents">${comment.content}</div>
              </div>
              <div class="post-controll-button">
                <button id="button-update" class="post-controll-button-detail">수정</button>
                <button id="button-delete" class="post-controll-button-detail">삭제</button>
              </div>
            </div>
            `,
          )
          .join('')}
      </div>
      <div class="scroll-sentinel"></div>
    `
  }

  addEventListener(comments) {
    this.registerComment()
    this.updateComment(comments)
    this.deleteComments(comments)
  }

  registerComment() {
    const commentArea = document.getElementById('comment')
    const commentButton = document.getElementById('comment-button')

    this.checkCommentInput(commentArea)
    this.ConfirmComment(commentArea, commentButton)
  }

  updateComment(comments) {
    const updateButtons = this.shadowRoot.querySelectorAll('#button-update')

    updateButtons.forEach((button) => {
      const oldButton = button.cloneNode(true)
      button.parentNode.replaceChild(oldButton, button)
    })

    const newUpdateButtons = this.shadowRoot.querySelectorAll('#button-update')
    newUpdateButtons.forEach((button, index) => {
      if (
        !this.isLogin ||
        this.storedData.nickname !== comments[index].writer
      ) {
        button.style.visibility = 'hidden'
      } else {
        button.addEventListener('click', () => {
          this.handleUpdate(comments[index].id, comments[index].content)
        })
      }
    })
  }

  deleteComments(comments) {
    const deleteButtons = this.shadowRoot.querySelectorAll('#button-delete')

    deleteButtons.forEach((button) => {
      const oldButton = button.cloneNode(true)
      button.parentNode.replaceChild(oldButton, button)
    })

    const newDeleteButtons = this.shadowRoot.querySelectorAll('#button-delete')
    newDeleteButtons.forEach((button, index) => {
      if (
        !this.isLogin ||
        this.storedData.nickname !== comments[index].writer
      ) {
        button.style.visibility = 'hidden'
      } else {
        button.addEventListener('click', () => {
          this.openModal(comments[index].id)
        })
      }
    })
  }

  checkCommentInput(commentArea) {
    commentArea.addEventListener('input', () => this.validateForm())
  }

  ConfirmComment(commentArea, commentButton) {
    if (
      commentButton.innerText === '댓글 등록' &&
      commentButton.innerText !== '댓글 수정'
    ) {
      commentButton.addEventListener(
        'click',
        async () => {
          if (this.validateForm()) {
            const updatedContent = commentArea.value.trim()

            if (!this.isEditing && !this.isRequestInProgress) {
              this.isRequestInProgress = true // 요청 진행 중 상태 설정
              await uploadComment(
                this.postId,
                this.storedData.email,
                formatDate(Date.now()),
                updatedContent,
              )
              alert('댓글이 등록되었습니다.') // 추가
              this.isRequestInProgress = false // 요청 완료 후 상태 리셋
              // 페이지 새로 고침 대신, 댓글을 리스트에 추가
              commentArea.value = ''
              await this.loadCommentsData() // 새로운 댓글 데이터를 불러옵니다.
              location.reload()
            }
          }
        },
        { once: true },
      )
    }
  }

  async handleUpdate(id, content) {
    const commentArea = document.getElementById('comment')
    const commentButton = document.getElementById('comment-button')

    if (commentArea) {
      commentArea.value = content
      commentArea.focus()
    }

    if (commentButton) {
      commentButton.innerText = '댓글 수정'
      commentButton.dataset.commentId = id
      this.isEditing = true

      commentButton.addEventListener('click', async () => {
        const updatedContent = commentArea.value.trim()
        if (updatedContent) {
          await editComments(
            this.postId,
            id,
            updatedContent,
            formatDate(Date.now()),
          )
          location.reload()
          this.isEditing = false
        } else {
          alert('수정할 내용을 입력하세요.')
        }
      })
    }
  }

  validateForm() {
    const commentArea = document.getElementById('comment')
    const submit = document.getElementById('comment-button')

    if (submit) {
      submit.style.backgroundColor = '#aea0eb'
      submit.style.cursor = 'not-allowed'
    }

    let commentCheck = false

    if (commentArea && commentArea.value.trim()) {
      commentCheck = true
    }

    if (commentArea && commentCheck && submit) {
      submit.style.backgroundColor = '#7f6aee'
      submit.style.cursor = 'pointer'
      return true
    }
    return false
  }

  openModal(id) {
    const modalBackground = document.createElement('div')
    modalBackground.classList.add('modal-background')

    const modal = document.createElement('modal-element')
    modal.setAttribute('title-text', '댓글을 삭제하시겠습니까?')
    modal.setAttribute('description-text', '삭제한 내용은 복구할 수 없습니다.')

    document.body.appendChild(modalBackground)
    document.body.appendChild(modal)

    modal.onConfirm = () => this.deleteContirm(id)
    modalBackground.addEventListener('click', () => this.closeModal())
  }

  closeModal() {
    const modalBackground = this.shadowRoot.querySelector('.modal-background')
    const modal = this.shadowRoot.querySelector('modal-element')
    if (modalBackground) modalBackground.remove()
    if (modal) modal.remove()
  }

  async deleteContirm(commentId) {
    await deleteComments(this.postId, commentId)

    location.reload()
  }
}

customElements.define('comment-list-element', CommentListElement)
