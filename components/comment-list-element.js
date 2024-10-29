class CommentListElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    const comments = [
      {
        id: 1,
        writer: 'user1',
        updateAt: '2024-10-26 22:25:00',
        content: '첫 번째 댓글 내용',
      },
      {
        id: 2,
        writer: 'user2',
        updateAt: '2024-10-26 22:24:01',
        content: '두 번째 댓글 내용',
      },
      {
        id: 3,
        writer: 'user3',
        updateAt: '2024-10-26 22:20:10',
        content: '세 번째 댓글 내용',
      },
    ]

    this.shadowRoot.innerHTML = this.template(comments)

    const updateButtons = this.shadowRoot.querySelectorAll('#button-update')
    const deleteButtons = this.shadowRoot.querySelectorAll('#button-delete')

    const commentArea = document.getElementById('comment')
    const commentButton = document.getElementById('comment-button')

    updateButtons.forEach((button, index) => {
      button.addEventListener('click', () =>
        this.handleUpdate(comments[index].id),
      )
    })

    deleteButtons.forEach((button, index) => {
      button.addEventListener('click', () => openModal(comments[index].id))
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

    function openModal(id) {
      const modalBackground = document.createElement('div')
      modalBackground.classList.add('modal-background')

      const modal = document.createElement('modal-element')
      modal.setAttribute('title-text', '댓글을 삭제하시겠습니까?')
      modal.setAttribute(
        'description-text',
        '삭제한 내용은 복구할 수 없습니다.',
      )

      document.body.appendChild(modalBackground)
      document.body.appendChild(modal)

      modal.onConfirm = () => location.reload()
      modalBackground.addEventListener('click', () => this.closeModal())
      console.log(`${id}번째 댓글이 삭제되었습니다.`)
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

  handleUpdate(id) {
    console.log(`댓글 ${id} 수정`)
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
}

customElements.define('comment-list-element', CommentListElement)
