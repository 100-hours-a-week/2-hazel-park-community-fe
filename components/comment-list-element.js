import {
  getComments,
  uploadComment,
  editComments,
  deleteComments,
} from '/services/comment-api.js'
import { getSessionUser } from '/services/user-api.js'

import { formatDate, formatCommentDate } from '/utils/format-date.js'
import handleNavigation from '/utils/navigation.js'

class CommentListElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.postId = null
    this.user = null
    this.isEditing = false
    this.page = 0
    this.allCommentsLoaded = false
    this.COMMENTS_PER_PAGE = 2
    this.comments = []
    this.isLoading = false
    this.isRequestInProgress = false
    this.loadingPromise = null // 로딩 상태 관리
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

    // 로딩 상태 Promise 저장
    this.loadingPromise = this.loadCommentsData()

    this.user = await getSessionUser()

    this.initInfiniteScroll()

    this.addEventListener(this.comments)
  }

  async fetchData() {
    if (!this.loadingPromise) {
      this.loadingPromise = this.loadCommentsData()
    }
    return this.loadingPromise
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

  renderComments() {
    // 기존 댓글 컨테이너 비우기
    const commentsContainer = this.shadowRoot.querySelector('div')
    commentsContainer.innerHTML = ''

    // 모든 댓글 다시 렌더링
    const commentsHtml = this.comments
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
      .join('')

    commentsContainer.insertAdjacentHTML('beforeend', commentsHtml)

    const commentElements = commentsContainer.querySelectorAll('.comment-wrap')
    commentElements.forEach((element, index) => {
      element.classList.add('visible')
    })

    this.addEventListener(this.comments)

    if (!this.allCommentsLoaded && this.observer) {
      this.observer.disconnect()
      this.initInfiniteScroll()
    }
  }

  async loadCommentsData() {
    if (this.isLoading || this.allCommentsLoaded) return

    try {
      this.isLoading = true

      if (this.page === 0) {
        const newComments = await getComments({
          postId: this.postId,
          page: this.page,
          limit: this.COMMENTS_PER_PAGE,
        })

        if (Array.isArray(newComments) && newComments.length > 0) {
          const filteredComments = newComments.filter(
            (newComment) =>
              !this.comments.some(
                (existingComment) => existingComment.id === newComment.id,
              ),
          )

          this.comments = [...this.comments, ...filteredComments]
          this.page += 1
        } else {
          this.allCommentsLoaded = true
          this.stopInfiniteScroll()
        }
      } else {
        this.showLoadingAnimation()
        const [newComments] = await Promise.all([
          getComments({
            postId: this.postId,
            page: this.page,
            limit: this.COMMENTS_PER_PAGE,
          }),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ])

        if (Array.isArray(newComments) && newComments.length > 0) {
          const filteredComments = newComments.filter(
            (newComment) =>
              !this.comments.some(
                (existingComment) => existingComment.id === newComment.id,
              ),
          )

          this.comments = [...this.comments, ...filteredComments]
          this.page += 1
        } else {
          this.allCommentsLoaded = true
          this.stopInfiniteScroll()
        }
      }

      this.renderComments()

      if (this.comments.length < this.page * this.COMMENTS_PER_PAGE) {
        this.allCommentsLoaded = true
        this.stopInfiniteScroll()
      }
    } catch (error) {
      console.error('댓글을 불러오는 데 실패했습니다:', error)
    } finally {
      this.hideLoadingAnimation()
      this.isLoading = false
    }

    return Promise.resolve() // 로딩 완료 후 Promise 반환
  }

  // 외부에서 호출 가능한 로딩 상태 반환 메서드
  getLoadingPromise() {
    return this.loadingPromise
  }

  initInfiniteScroll() {
    setTimeout(() => {
      const sentinel = this.shadowRoot.querySelector('.scroll-sentinel')
      if (!sentinel) {
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
          root: null,
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
      <style>
        .comment-wrap {
          visibility: hidden; 
        }
        .comment-wrap.visible {
          visibility: visible;
        }
      </style>
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
                  <div class="post-updateAt">${formatDate(comment.updated_at)}</div>
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

    let charCountDisplay = document.createElement('div')
    charCountDisplay.id = 'char-count'
    charCountDisplay.style.cssText = `
      font-size: 0.9rem;
      color: #666;
      margin-top: 5px;
      text-align: right;
    `
    charCountDisplay.textContent = `0 / 100`

    if (!document.getElementById('char-count')) {
      commentArea.parentNode.appendChild(charCountDisplay)
    }

    // 입력 이벤트로 글자 수 체크 및 제한
    commentArea.addEventListener('input', () => {
      const maxLength = 100
      const currentLength = commentArea.value.length

      if (currentLength > maxLength) {
        commentArea.value = commentArea.value.substring(0, maxLength)
      }

      charCountDisplay.textContent = `${commentArea.value.length} / ${maxLength}`

      this.validateForm()
    })

    this.checkCommentInput(commentArea)
    this.ConfirmComment(commentArea, commentButton)
  }

  updateComment(comments) {
    const updateButtons = this.shadowRoot.querySelectorAll('#button-update')

    updateButtons.forEach((button, index) => {
      // 기존 이벤트 리스너 제거
      button.replaceWith(button.cloneNode(true)) // 기존 버튼을 새로운 노드로 교체
      const newButton =
        this.shadowRoot.querySelectorAll('#button-update')[index]

      // 수정 권한이 없는 사용자에 대한 처리
      if (!this.user || this.user.nickname !== comments[index].writer) {
        newButton.style.visibility = 'hidden'
      } else {
        // 새로운 이벤트 리스너 등록
        newButton.addEventListener('click', async () => {
          await this.handleUpdate(comments[index].id, comments[index].content)
        })
      }
    })
  }

  async deleteComments(comments) {
    const deleteButtons = this.shadowRoot.querySelectorAll('#button-delete')

    deleteButtons.forEach((button) => {
      const oldButton = button.cloneNode(true)
      button.parentNode.replaceChild(oldButton, button)
    })

    const newDeleteButtons = this.shadowRoot.querySelectorAll('#button-delete')
    newDeleteButtons.forEach((button, index) => {
      if (!this.user || this.user.nickname !== comments[index].writer) {
        button.style.visibility = 'hidden'
      } else {
        button.addEventListener('click', async () => {
          this.openModal(comments[index].id)
        })
      }
    })
  }

  checkCommentInput(commentArea) {
    commentArea.addEventListener('input', () => this.validateForm())
  }

  ConfirmComment(commentArea, commentButton) {
    if (commentButton.innerText === 'Respond') {
      const newButton = commentButton.cloneNode(true)
      commentButton.parentNode.replaceChild(newButton, commentButton)

      newButton.addEventListener('click', async () => {
        if (!this.user) {
          alert('로그인 후 이용할 수 있습니다.')
          handleNavigation('/html/Log-in.html')
          return
        }

        if (this.validateForm()) {
          const updatedContent = commentArea.value.trim()

          if (!this.isEditing && !this.isRequestInProgress) {
            this.isRequestInProgress = true
            try {
              // 댓글 업로드 API 호출
              await uploadComment(
                this.postId,
                this.user.email,
                formatDate(Date.now()),
                updatedContent,
              )

              // 입력창 초기화
              commentArea.value = ''

              // 버튼 상태 초기화
              newButton.style.backgroundColor = 'transparent'
              newButton.style.cursor = 'not-allowed'
              newButton.disabled = true

              // 댓글 데이터 다시 로드
              this.page = 0
              this.comments = []
              this.allCommentsLoaded = false

              await this.loadCommentsData()
            } catch (error) {
              alert('댓글 등록 중 문제가 발생했습니다.')
            } finally {
              this.isRequestInProgress = false
              location.reload()
            }
          }
        }
      })
    }
  }

  async handleUpdate(id, content) {
    const commentArea = document.getElementById('comment')
    const commentButton = document.getElementById('comment-button')

    if (commentArea) {
      commentArea.value = content // 수정하려는 댓글 내용을 입력 필드에 넣기
      commentArea.focus()
    }

    if (commentButton) {
      commentButton.innerText = 'Edit'
      this.isEditing = true

      // 클릭 이벤트 추가
      const updateListener = async () => {
        const updatedContent = commentArea.value.trim()
        if (updatedContent) {
          try {
            this.isRequestInProgress = true

            // 댓글 수정 API 호출
            await editComments(
              this.postId,
              id,
              updatedContent,
              formatDate(Date.now()),
            )

            // 상태 초기화
            this.isEditing = false
            this.isRequestInProgress = false

            commentArea.value = ''

            // 댓글 데이터 다시 로드
            this.page = 0
            this.comments = []
            this.allCommentsLoaded = false

            let charCountDisplay = document.getElementById('char-count')
            charCountDisplay.textContent = `0 / 100`

            commentButton.innerText = 'Respond' // 버튼 텍스트를 "댓글 등록"으로 변경
            commentButton.style.backgroundColor = 'transparent'
            commentButton.style.cursor = 'not-allowed'
            //commentButton.disabled = true // 버튼 비활성화

            await this.loadCommentsData() // 댓글 데이터 다시 로딩
          } catch (error) {
            alert('댓글 수정 중 문제가 발생했습니다.')
          } finally {
            this.isRequestInProgress = false
          }
        } else {
          alert('수정할 내용을 입력하세요.')
        }
      }

      // 기존 이벤트 제거 후 재등록
      commentButton.removeEventListener('click', updateListener) // 안전한 제거
      commentButton.addEventListener('click', updateListener)
    }
  }

  validateForm() {
    const commentArea = document.getElementById('comment')
    const submit = document.getElementById('comment-button')

    if (submit) {
      submit.style.backgroundColor = 'transparent'
      submit.style.cursor = 'not-allowed'
    }

    let commentCheck = false

    if (commentArea && commentArea.value.trim()) {
      commentCheck = true
    }

    if (commentArea && commentCheck && submit) {
      submit.style.backgroundColor = '#141414'
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
    try {
      await deleteComments(this.postId, commentId) // 댓글 삭제 API 호출

      // 댓글 삭제 후 전체 데이터 다시 로드
      this.page = 0 // 페이지 번호 초기화
      this.comments = [] // 기존 댓글 데이터 초기화
      this.allCommentsLoaded = false // 모든 댓글 로딩 상태 초기화

      await this.loadCommentsData() // 댓글 데이터 다시 로딩
    } catch (error) {
      alert('댓글 삭제 중 문제가 발생했습니다.')
    } finally {
      // 모달 및 배경 닫기
      this.closeModal()
    }
    location.reload()
  }
}

customElements.define('comment-list-element', CommentListElement)
