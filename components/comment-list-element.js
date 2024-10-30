import { editComments, getComments } from '../services/comment-api.js'
import { formatDate } from '../utils/format-date.js'

class CommentListElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.postId = null
  }

  async connectedCallback() {
    const urlParams = new URLSearchParams(window.location.search)
    this.postId = Number(urlParams.get('id'))

    if (this.postId) {
      console.log(this.postId)
      const comments = await getComments(this.postId)
      //const comments = await this.fetchComments(this.postId)
      this.shadowRoot.innerHTML = this.template(comments)

      const updateButtons = this.shadowRoot.querySelectorAll('#button-update')
      const deleteButtons = this.shadowRoot.querySelectorAll('#button-delete')

      const commentArea = document.getElementById('comment')
      const commentButton = this.shadowRoot.getElementById('comment-button')

      updateButtons.forEach((button, index) => {
        button.addEventListener('click', () =>
          this.handleUpdate(comments[index].id, comments[index].content),
        )
      })

      deleteButtons.forEach((button, index) => {
        button.addEventListener('click', () =>
          this.openModal(comments[index].id),
        )
      })

      if (commentArea) {
        commentArea.addEventListener('input', () => this.validateForm())
      }

      if (commentButton) {
        commentButton.addEventListener('click', (event) => {
          if (this.validateForm()) {
            console.log('댓글 등록 완료')
          } else {
            console.log('등록 실패')
          }
        })
      }
    } else {
      console.error('postId를 찾을 수 없습니다.')
    }
  }

  async fetchComments(postId) {
    try {
      const response = await fetch('../data/comments.json')
      const data = await response.json()
      return data.comments[postId] || []
    } catch (error) {
      console.error('댓글을 불러오는 데 실패했습니다:', error)
      return []
    }
  }

  template(comments) {
    return `
      <link rel="stylesheet" href="../styles/global.css" />
      <link rel="stylesheet" href="../styles/post.css" />
      <div>
        ${comments
          .map(
            (comment) => `
            <div class="comment-wrap">
              <div class="comment-wrap-detail">
                <div class="comment-writer-info">
                  <div class="post-writer-img"></div>
                  <div class="post-writer-name">${comment.writer}</div>
                  <div class="post-updateAt">${comment.updateAt}</div>
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
    `
  }

  async handleUpdate(id, content) {
    console.log(`댓글 ${id} 수정`)
    const commentArea = document.getElementById('comment')
    const commentButton = document.getElementById('comment-button')
    if (commentArea) {
      commentArea.value = content
      commentArea.focus()
    }
    if (commentButton) {
      if (!commentButton.innerText === '댓글 수정') {
      }
      commentButton.innerText = '댓글 수정'
      commentButton.dataset.commentId = id
      console.log(this.postId, id, content)
      commentButton.onclick = async () => {
        const updatedContent = commentArea.value.trim()
        if (updatedContent) {
          await editComments(
            this.postId,
            id,
            updatedContent,
            formatDate(Date.now()),
          )
          console.log('댓글 수정 완료')
          location.reload()
        } else {
          console.log('수정할 내용이 없습니다.')
        }
      }
    }
  }

  validateForm() {
    const commentArea = this.shadowRoot.getElementById('comment')
    const submit = this.shadowRoot.getElementById('comment-button')

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

    modal.onConfirm = () => location.reload()
    modalBackground.addEventListener('click', () => this.closeModal())
    console.log(`${id}번째 댓글이 삭제되었습니다.`)
  }

  closeModal() {
    const modalBackground = this.shadowRoot.querySelector('.modal-background')
    const modal = this.shadowRoot.querySelector('modal-element')
    if (modalBackground) modalBackground.remove()
    if (modal) modal.remove()
  }
}

customElements.define('comment-list-element', CommentListElement)
