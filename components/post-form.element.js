import handleNavigation from '../utils/navigation.js'

class postFormElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.isMakePostPage = true
    this.postId = null
    this.postData = null
  }

  connectedCallback() {
    this.checkLocation()
    if (!this.isMakePostPage) {
      this.loadPostData()
    }
    this.shadowRoot.innerHTML = this.template()
    this.addEventListener()
  }

  template() {
    return `
        <link rel="stylesheet" href="../styles/global.css" />
        <link rel="stylesheet" href="../styles/Sign-in.css" />
        <link rel="stylesheet" href="../styles/edit-profile.css" />
        <link rel="stylesheet" href="../styles/make-post.css" />
        <div class="post-form-wrap">
            <form class="post-form">
              ${
                this.isMakePostPage
                  ? '<div>' +
                    '<div class="input-title">제목*</div>' +
                    '<input id="input-title" type="text" placeholder="제목을 입력해주세요. (최대 26글자)" class="input-value" />' +
                    '<div id="title-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text"></div>' +
                    '</div>' +
                    '<div class="email-wrap">' +
                    '<div class="input-title">내용*</div>' +
                    '<textarea id="input-contents" type="text" placeholder="내용을 입력해주세요." class="input-value input-value-textarea"></textarea>' +
                    '<div id="contents-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text">dfsfs</div>' +
                    '</div>' +
                    '<div class="nickname-wrap">' +
                    '<div class="input-title">이미지</div>' +
                    '<div class="input-file-wrap"><input id="input-nickname" type="file" class="input-value-file"/>' +
                    '<label for="input-nickname" class="input-file-label">파일 선택</label>' +
                    '<span class="input-file-span">파일을 선택해주세요.</span>' +
                    '</div>' +
                    '<div id="nickname-hyper-text" style="height: 1.5rem" class="hyper-text"></div>' +
                    '</div>'
                  : '<div>' +
                    '<div class="input-title">제목*</div>' +
                    `<input id="input-title" type="text" placeholder="제목을 입력해주세요. (최대 26글자)" class="input-value" value="${this.postData?.post_title || ''}" />` +
                    '<div id="title-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text"></div>' +
                    '</div>' +
                    '<div class="email-wrap">' +
                    '<div class="input-title">내용*</div>' +
                    `<textarea id="input-contents" placeholder="내용을 입력해주세요." class="input-value input-value-textarea">${this.postData?.post_contents || ''}</textarea>` +
                    '<div id="contents-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text"></div>' +
                    '</div>' +
                    '<div class="nickname-wrap">' +
                    '<div class="input-title">이미지</div>' +
                    '<div class="input-file-wrap"><input id="input-nickname" type="file" class="input-value-file"/>' +
                    '<label for="input-nickname" class="input-file-label">파일 선택</label>' +
                    '<span class="input-file-span">파일을 선택해주세요.</span>' +
                    '</div>' +
                    '<div id="nickname-hyper-text" style="height: 1.5rem" class="hyper-text"></div>' +
                    '</div>'
              }           
                <input id="submit" type="submit" value="완료" class="make-post-submit" />
            </form>
        </div>`
  }

  addEventListener() {
    const inputTitle = this.shadowRoot.getElementById('input-title')
    const inputContents = this.shadowRoot.getElementById('input-contents')
    const submit = this.shadowRoot.getElementById('submit')

    if (inputTitle) {
      inputTitle.addEventListener('input', () => this.validateForm())
    }

    if (inputContents) {
      inputContents.addEventListener('input', () => this.validateForm())
    }

    if (submit) {
      submit.addEventListener('click', (event) => {
        event.preventDefault()
        if (this.validateForm() === 'posts') {
          const titleValue = inputTitle.value.trim()
          const contentsValue = inputContents.value.trim()
          this.saveDataInLocalStorage(titleValue, contentsValue)
          handleNavigation('/html/Posts.html')
        }
      })
    }
  }

  validateForm() {
    const inputTitle = this.shadowRoot.getElementById('input-title')
    const inputContents = this.shadowRoot.getElementById('input-contents')
    const titleHyperText = this.shadowRoot.getElementById('title-hyper-text')
    const contentsHyperText = this.shadowRoot.getElementById(
      'contents-hyper-text',
    )
    const submit = this.shadowRoot.getElementById('submit')
    submit.style.backgroundColor = '#aea0eb'
    submit.style.cursor = 'not-allowed'

    if (titleHyperText) {
      titleHyperText.innerText = ''
    }

    if (contentsHyperText) {
      contentsHyperText.innerText = ''
    }

    let titleCheck = false
    let contentsCheck = false

    if (!inputTitle.value.trim()) {
      titleCheck = false
      titleHyperText.innerText = '제목, 내용을 모두 작성해주세요.'
      titleHyperText.style.visibility = 'visible'
    } else if (inputTitle.value.length > 26) {
      titleCheck = false
      titleHyperText.innerText = '제목은 26자 이하로 작성해주세요.'
      titleHyperText.style.visibility = 'visible'
      inputTitle.value = inputTitle.value.slice(0, 26)
    } else {
      titleCheck = true
      titleHyperText.style.visibility = 'hidden'
    }

    if (!inputContents.value.trim()) {
      contentsCheck = false
      contentsHyperText.innerText = '제목, 내용을 모두 작성해주세요.'
      contentsHyperText.style.visibility = 'visible'
    } else {
      contentsCheck = true
      contentsHyperText.style.visibility = 'hidden'
    }

    if (titleCheck && contentsCheck) {
      submit.style.backgroundColor = '#7f6aee'
      submit.style.cursor = 'pointer'
      return 'posts'
    }
  }

  checkLocation() {
    const currentPath = window.location.pathname
    if (currentPath === '/html/make-post.html') {
      this.isMakePostPage = true
    } else {
      this.isMakePostPage = false
    }
  }

  saveDataInLocalStorage(titleValue, contentsValue) {
    const storedData = JSON.parse(localStorage.getItem('user'))
    const post = {
      post_id: 1,
      post_title: titleValue,
      post_writer: storedData.user_name,
      post_updatedAt: new Date().toISOString(),
      post_contents: contentsValue,
      post_likes: 0,
      post_views: 0,
      post_comments: 0,
    }

    localStorage.setItem('post', JSON.stringify(post))
  }

  loadPostData() {
    const urlParams = new URLSearchParams(window.location.search)
    this.postId = Number(urlParams.get('id'))

    if (!this.postId) {
      console.error('해당 ID의 포스트를 찾을 수 없습니다.')
      return
    }

    fetch('../data/posts.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText)
        }
        return response.json()
      })
      .then((allPosts) => {
        this.postData = allPosts.find((post) => post.post_id === this.postId)
        if (!this.postData) {
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
    const inputTitle = this.shadowRoot.getElementById('input-title')
    const inputContents = this.shadowRoot.getElementById('input-contents')

    if (inputTitle) {
      inputTitle.value = this.postData.post_title
    }

    if (inputContents) {
      inputContents.value = this.postData.post_contents
    }
  }
}

customElements.define('post-form-element', postFormElement)
