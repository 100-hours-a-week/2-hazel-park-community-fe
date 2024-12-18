import handleNavigation from '/utils/navigation.js'
import { uploadPost, getPostDetail, patchPost } from '/services/post-api.js'
import { formatDate } from '/utils/format-date.js'

class postFormElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.isMakePostPage = true
    this.postId = null
    this.postData = null
    this.storedData = JSON.parse(localStorage.getItem('user'))
    this.postImg = null
  }

  async connectedCallback() {
    const isLogin = JSON.parse(localStorage.getItem('isLogin')) || false
    if (!isLogin) {
      alert('로그인 후 작성할 수 있습니다.')
      handleNavigation('/html/Log-in.html')

      return
    }
    this.checkLocation()
    if (!this.isMakePostPage) {
      await this.loadPostData()
    }
    this.shadowRoot.innerHTML = this.template()
    this.addEventListener()
  }

  template() {
    return `
        <link rel="stylesheet" href="/styles/global.css">
        <link rel="stylesheet" href="/styles/Sign-in.css">
        <link rel="stylesheet" href="/styles/edit-profile.css">
        <link rel="stylesheet" href="/styles/make-post.css">
        <div class="post-form-wrap">
            <form class="post-form">
              ${
                this.isMakePostPage ? this.makePostForm() : this.editPostForm()
              }           
                <input id="submit" type="submit" value="완료" class="make-post-submit" />
            </form>
        </div>`
  }

  makePostForm() {
    return `    
      <div>
        <div class="input-title">제목*</div>
        <input id="input-title" type="text" placeholder="제목을 입력해주세요. (최대 26글자)" class="input-value" />
        <div id="title-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text"></div>
      </div>
      <div class="email-wrap">
          <div class="input-title">내용*</div>
          <textarea id="input-contents" type="text" placeholder="내용을 입력해주세요." class="input-value input-value-textarea"></textarea>
          <div id="contents-char-count" style="text-align: right; font-size: 0.9rem; color: #666;">
              0 / 1000
          </div>
          <div id="contents-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text"></div>
      </div>
      <div class="nickname-wrap">
        <div class="input-title">이미지</div>
        <div class="input-file-wrap">
          <input id="imageUpload" type="file" class="input-value-file" accept=".jpg, .jpeg, .png, .gif"/>
          <label for="imageUpload" class="input-file-label">파일 선택</label>
          <span id="input-file-span" class="input-file-span">파일을 선택해주세요.</span>
        </div>
        <div id="nickname-hyper-text" style="height: 1.5rem" class="hyper-text"></div>
      </div>
    `
  }

  editPostForm() {
    const { post_title, post_contents, post_img, post_writer } =
      this.postData || {}
    if (this.storedData.nickname === post_writer) {
      return `
      <div>
        <div class="input-title">제목*</div>
        <input id="input-title" type="text" placeholder="제목을 입력해주세요. (최대 26글자)" class="input-value" value="${post_title}" />
        <div id="title-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text"></div>
      </div>
      <div class="email-wrap">
          <div class="input-title">내용*</div>
          <textarea id="input-contents" type="text" placeholder="내용을 입력해주세요." class="input-value input-value-textarea">${post_contents}</textarea>
          <div id="contents-char-count" style="text-align: right; font-size: 0.9rem; color: #666;">
              ${post_contents.length} / 1000
          </div>
          <div id="contents-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text"></div>
      </div>
      <div class="nickname-wrap">
        <div class="input-title">이미지</div>
        <div class="input-file-wrap">
          <input id="imageUpload" type="file" class="input-value-file" accept=".jpg, .jpeg, .png, .gif"/>
          <label for="imageUpload" class="input-file-label">파일 선택</label>
        ${
          post_img
            ? this.isMakePostPage
              ? `
                <span class="input-file-span">${post_img}</span>
              `
              : `<span id="input-file-span" class="input-file-span">${post_img}</span>`
            : `
                <span id="input-file-span" class="input-file-span">파일을 선택해주세요.</span>

              `
        }
      </div>
        <div id="nickname-hyper-text" style="height: 1.5rem" class="hyper-text"></div>
      </div>
    `
    } else {
      alert('올바르지 않은 접근입니다.')
      handleNavigation('/html/Posts.html')
    }
  }

  addEventListener() {
    const inputTitle = this.shadowRoot.getElementById('input-title')
    const inputContents = this.shadowRoot.getElementById('input-contents')
    const submit = this.shadowRoot.getElementById('submit')

    const imageUpload = this.shadowRoot.getElementById('imageUpload')
    const imageSpan = this.shadowRoot.getElementById('input-file-span')

    if (imageUpload) {
      imageUpload.addEventListener('change', (event) => {
        imageSpan.innerText = event.target.files[0].name
        const file = event.target.files[0]
        if (file) {
          if (this.validateImageFile(file)) {
            this.handleImageUpload(file)
          } else {
            alert('이미지 파일만 업로드 가능합니다. (jpg, jpeg, png, gif)')
          }
        }
      })
    }

    if (inputTitle) {
      inputTitle.addEventListener('input', () => this.validateForm())
    }

    if (inputContents) {
      inputContents.addEventListener('input', () => this.validateForm())
    }

    if (submit) {
      submit.addEventListener('click', async (event) => {
        event.preventDefault()
        if (!this.isMakePostPage) {
          const titleValue = inputTitle.value.trim()
          const contentsValue = inputContents.value.trim()
          await patchPost(
            this.postId,
            titleValue,
            contentsValue,
            formatDate(Date.now()),
            this.postImg,
          )
          handleNavigation('/html/Posts.html')
        } else if (this.validateForm() === 'posts') {
          const titleValue = inputTitle.value.trim()
          const contentsValue = inputContents.value.trim()
          this.saveDataInLocalStorage(titleValue, contentsValue)
          await uploadPost(
            titleValue,
            this.storedData.email,
            formatDate(Date.now()),
            contentsValue,
            this.postImg,
          )
          handleNavigation('/html/Posts.html')
        }
      })
    }
  }

  validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    return validTypes.includes(file.type)
  }

  handleImageUpload(file) {
    const reader = new FileReader()

    reader.onload = (e) => {
      this.postImg = e.target.result
    }

    reader.readAsDataURL(file)
  }

  validateForm() {
    const inputTitle = this.shadowRoot.getElementById('input-title')
    const inputContents = this.shadowRoot.getElementById('input-contents')
    const titleHyperText = this.shadowRoot.getElementById('title-hyper-text')
    const contentsHyperText = this.shadowRoot.getElementById(
      'contents-hyper-text',
    )
    const charCountDisplay = this.shadowRoot.getElementById(
      'contents-char-count',
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
      titleHyperText.innerText = '제목을 작성해주세요.'
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

    // 내용 검증 및 글자수 업데이트
    if (!inputContents.value.trim()) {
      contentsCheck = false
      contentsHyperText.innerText = '내용을 작성해주세요.'
      contentsHyperText.style.visibility = 'visible'
    } else if (inputContents.value.length > 1000) {
      contentsCheck = false
      contentsHyperText.innerText = '내용은 1000자 이하로 작성해주세요.'
      contentsHyperText.style.visibility = 'visible'
      inputContents.value = inputContents.value.slice(0, 1000)
    } else {
      contentsCheck = true
      contentsHyperText.style.visibility = 'hidden'
    }

    // 글자수 업데이트
    if (charCountDisplay) {
      charCountDisplay.innerText = `${inputContents.value.length} / 1000`
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
      post_updated_at: new Date().toISOString(),
      post_contents: contentsValue,
      post_likes: 0,
      post_views: 0,
      post_comments: 0,
    }

    localStorage.setItem('post', JSON.stringify(post))
  }

  async loadPostData() {
    const urlParams = new URLSearchParams(window.location.search)
    this.postId = Number(urlParams.get('id'))

    if (!this.postId) {
      console.error('해당 ID의 포스트를 찾을 수 없습니다.')
      return
    }

    this.postData = await getPostDetail(this.postId)
  }
}

customElements.define('post-form-element', postFormElement)
