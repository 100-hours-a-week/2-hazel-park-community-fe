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

    updateButtons.forEach((button, index) => {
      button.addEventListener('click', () =>
        this.handleUpdate(comments[index].id),
      )
    })

    deleteButtons.forEach((button, index) => {
      button.addEventListener('click', () =>
        this.handleDelete(comments[index].id),
      )
    })
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

  handleDelete(id) {
    console.log(`댓글 ${id} 삭제`)
  }
}

customElements.define('comment-list-element', CommentListElement)
