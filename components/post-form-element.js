import handleNavigation from '/utils/navigation.js'
import { getSessionUser } from '/services/user-api.js'
import { uploadPost, getPostDetail, patchPost } from '/services/post-api.js'
import { formatDate } from '/utils/format-date.js'

class postFormElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.isMakePostPage = true
    this.postId = null
    this.postData = null
    this.user = null
    this.postImg = null
  }

  async connectedCallback() {
    this.style.visibility = 'hidden' // 콘텐츠 숨기기

    this.user = await getSessionUser()
    if (!this.user) {
      alert('로그인 후 작성할 수 있습니다.')
      handleNavigation('/html/Log-in.html')
      return
    }

    this.checkLocation()

    if (!this.isMakePostPage) {
      await this.loadPostData()
      if (!this.postData) {
        return
      }
      if (this.user.nickname !== this.postData.post_writer) {
        alert('올바르지 않은 접근입니다.')
        handleNavigation('/html/Posts.html')
        return
      }
    }

    // 스타일 로드
    await this.loadStyles()

    this.shadowRoot.innerHTML = this.template()
    this.addEventListener()

    this.style.visibility = 'visible' // 콘텐츠 표시
  }

  async loadStyles() {
    const styles = await Promise.all([
      fetch('/styles/global.css').then((res) => res.text()),
      fetch('/styles/Sign-in.css').then((res) => res.text()),
      fetch('/styles/edit-profile.css').then((res) => res.text()),
      fetch('/styles/make-post.css').then((res) => res.text()),
    ])

    // 로드한 스타일 시트를 CSSStyleSheet 객체로 생성
    const mainStyleSheet = new CSSStyleSheet()
    mainStyleSheet.replaceSync(styles.join('\n'))

    // 추가 스타일 시트 정의
    const additionalStyles = new CSSStyleSheet()
    additionalStyles.replaceSync(`
       .input-value {
        margin-top: 1.481vh;
        padding: 1.852vh 0 1.852vh 1.25vw;
        width: 100%;
        box-sizing: border-box;
        border: none;
        border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.16));
        background-color: var(--input-value-bg, #ffffff);
        color: var(--input-value-color);
      }
  
      .input-file-span {
        padding: 0.556vh 0 0.556vh 0;
        margin-left: 0.625vw;
        display: block;
        line-height: 1.0444rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
        color: var(--input-value-color);
      }

      .login-submit {
        width: 355px;
        height: 33px;
        margin-top: 1vh;
        padding-top: 0.741vh;
        padding-bottom: 0.741vh;
        background-color: var(--login-submit-bg);
        border: none;
        border-radius: 4px;
        color: #ffffff;
        font-weight: 500;
        font-size: 14px;
        cursor: not-allowed;
      }
    `)

    this.shadowRoot.adoptedStyleSheets = [mainStyleSheet, additionalStyles]

    this.setupThemeObserver()

    this.style.visibility = 'visible' // 콘텐츠 표시
  }

  setupThemeObserver() {
    // 초기 테마 설정
    this.updateThemeVariables()

    // body의 class 변경 감지
    const observer = new MutationObserver(() => {
      this.updateThemeVariables()
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }

  updateThemeVariables() {
    const isDarkMode = document.body.classList.contains('dark-mode')
    const host = this.shadowRoot.host

    host.style.setProperty(
      '--border-color',
      isDarkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.16)',
    )
    host.style.setProperty(
      '--input-value-bg',
      isDarkMode ? '#141414' : '#ffffff',
    )

    host.style.setProperty('--input-value-color', isDarkMode ? '#ffffff' : '')
    host.style.setProperty('--login-submit-bg', isDarkMode ? '#8e8e93' : '')
  }

  template() {
    return `
      <div class="post-form-wrap">
        <form class="post-form-detail">
          ${this.isMakePostPage ? this.makePostForm() : this.editPostForm()}
          <input id="submit" type="submit" value="Post" class="make-post-submit" />
        </form>
      </div>`
  }

  makePostForm() {
    return `    
      <div>
        <div class="input-title">Title *</div>
        <input id="input-title" type="text" placeholder="제목을 입력해주세요. (최대 26글자)" class="input-value" />
        <div id="title-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text"></div>
      </div>
      <div class="email-wrap">
          <div class="input-title">Contents *</div>
          <textarea id="input-contents" placeholder="내용을 입력해주세요." class="input-value input-value-textarea"></textarea>
          <div id="contents-char-count" style="text-align: right; font-size: 0.9rem; color: #666;">
              0 / 1000
          </div>
          <div id="contents-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text"></div>
      </div>
      <div class="nickname-wrap">
        <div class="input-title">Photo</div>
        <div class="input-file-wrap">
          <input id="imageUpload" type="file" class="input-value-file" accept=".jpg, .jpeg, .png, .gif"/>
          <label for="imageUpload" class="input-file-label">
            Upload
          </label>
          <span id="input-file-span" class="input-file-span">Your photo</span>
        </div>
        <div id="nickname-hyper-text" style="height: 1.5rem" class="hyper-text"></div>
      </div>
    `
  }

  editPostForm() {
    return `
      <div>
        <div class="input-title">Title *</div>
        <input id="input-title" type="text" placeholder="제목을 입력해주세요. (최대 26글자)" class="input-value" value="${this.escapeHtml(this.postData.post_title)}" />
        <div id="title-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text"></div>
      </div>
      <div class="email-wrap">
          <div class="input-title">Contents *</div>
          <textarea id="input-contents" placeholder="내용을 입력해주세요." class="input-value input-value-textarea">${this.escapeHtml(this.postData.post_contents)}</textarea>
          <div id="contents-char-count" style="text-align: right; font-size: 0.9rem; color: #666;">
              ${this.postData.post_contents.length} / 1000
          </div>
          <div id="contents-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text"></div>
      </div>
      <div class="nickname-wrap">
        <div class="input-title">Photo</div>
        <div class="input-file-wrap">
          <input id="imageUpload" type="file" class="input-value-file" accept=".jpg, .jpeg, .png, .gif"/>
          <label for="imageUpload" class="input-file-label">Upload</label>
          ${
            this.postImg
              ? `<div class="image-wrapper">
                  <img src="${this.postImg}" class="preview-image" />
                  <button type="button" id="delete-button" class="delete-button"></button>
                 </div>`
              : `<span id="input-file-span" class="input-file-span">Your photo</span>`
          }
      </div>
        <div id="nickname-hyper-text" style="height: 1.5rem" class="hyper-text"></div>
      </div>
    `
  }

  addEventListener() {
    const inputTitle = this.shadowRoot.getElementById('input-title')
    const inputContents = this.shadowRoot.getElementById('input-contents')
    const submit = this.shadowRoot.getElementById('submit')

    const imageUpload = this.shadowRoot.getElementById('imageUpload')
    const imageWrapper = this.shadowRoot.querySelector('.image-wrapper')
    const imageSpan = this.shadowRoot.getElementById('input-file-span')

    if (imageUpload) {
      imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0]
        if (file) {
          if (this.postImg) {
            alert('하나의 파일만 업로드할 수 있습니다.')
            imageUpload.value = '' // 파일 입력 필드 초기화
            return
          }

          const MAX_FILE_SIZE_MB = 10
          const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

          if (file.size > MAX_FILE_SIZE_BYTES) {
            alert(
              `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE_MB}MB까지 업로드 가능합니다.`,
            )
            imageUpload.value = ''
            return
          }

          if (this.validateImageFile(file)) {
            imageSpan.style.display = 'none'
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
          const titleValue = this.escapeHtml(inputTitle.value.trim())
          const contentsValue = this.escapeHtml(inputContents.value.trim())
          await patchPost(
            this.postId,
            titleValue,
            contentsValue,
            formatDate(Date.now()),
            this.postImg,
          )
          handleNavigation('/html/Posts.html')
        } else if (this.validateForm() === 'posts') {
          const titleValue = this.escapeHtml(inputTitle.value.trim())
          const contentsValue = this.escapeHtml(inputContents.value.trim())
          await uploadPost(
            titleValue,
            this.user.email,
            formatDate(Date.now()),
            contentsValue,
            this.postImg,
          )
          handleNavigation('/html/Posts.html')
        }
      })
    }

    const deleteButton = this.shadowRoot.querySelector('.delete-button')
    if (deleteButton && imageWrapper) {
      deleteButton.addEventListener('click', (event) => {
        event.preventDefault() // 기본 동작 방지
        this.postImg = null

        const imageWrapper = this.shadowRoot.querySelector('.image-wrapper')
        if (imageWrapper) {
          imageWrapper.remove()
        }

        // 파일 입력 필드 초기화
        if (imageUpload) {
          imageUpload.value = ''
        }

        // 파일 선택 안내 메시지 표시
        if (imageSpan) {
          imageSpan.style.display = 'block'
        }

        this.shadowRoot.innerHTML = this.template()
        this.addEventListener()
      })
    }
  }

  handleImageUpload(file) {
    const reader = new FileReader()

    reader.onload = (e) => {
      this.postImg = e.target.result

      const parent = this.shadowRoot.querySelector('.input-file-wrap')

      // 기존 이미지 wrapper 제거
      let imageWrapper = parent.querySelector('.image-wrapper')
      if (!imageWrapper) {
        imageWrapper = document.createElement('div')
        imageWrapper.classList.add('image-wrapper')
        parent.appendChild(imageWrapper)
      } else {
        imageWrapper.innerHTML = '' // 기존 내용 초기화
      }

      const previewImage = document.createElement('img')
      previewImage.classList.add('preview-image')
      previewImage.src = e.target.result
      imageWrapper.appendChild(previewImage)

      const deleteButton = document.createElement('button')
      deleteButton.type = 'button'
      deleteButton.id = 'delete-button'
      deleteButton.classList.add('delete-button')
      imageWrapper.appendChild(deleteButton)

      // 삭제 버튼 이벤트 리스너 등록
      deleteButton.addEventListener('click', () => {
        this.postImg = null
        console.log('이미지 삭제 완료')

        // DOM 초기화
        imageWrapper.remove()
        const imageSpan = this.shadowRoot.getElementById('input-file-span')
        if (imageSpan) {
          imageSpan.style.display = 'block'
        }

        const imageUpload = this.shadowRoot.getElementById('imageUpload')
        if (imageUpload) {
          imageUpload.value = ''
        }
      })
    }

    this.validateForm()
    reader.readAsDataURL(file)
  }

  validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    return validTypes.includes(file.type)
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
    submit.style.backgroundColor = ''
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
      if (charCountDisplay) {
        charCountDisplay.style.fontWeight = ''
      }
      contentsCheck = false
      contentsHyperText.innerText = '내용을 작성해주세요.'
      contentsHyperText.style.visibility = 'visible'
    } else if (inputContents.value.length == 1000) {
      if (charCountDisplay) {
        charCountDisplay.style.fontWeight = 'bold'
      }
      contentsCheck = true
      contentsHyperText.style.visibility = 'hidden'
    } else if (inputContents.value.length >= 1000) {
      charCountDisplay.style.fontWeight = ''
      contentsCheck = false
      inputContents.value = inputContents.value.slice(0, 1000)

      // 글자수 초과 시 빨간색 표시
      if (charCountDisplay) {
        charCountDisplay.style.fontWeight = ''
        charCountDisplay.style.color = '#c94a4a'
      }
    } else {
      contentsCheck = true
      contentsHyperText.style.visibility = 'hidden'

      // 글자수가 초과하지 않으면 기본 색상으로 변경
      if (charCountDisplay) {
        charCountDisplay.style.fontWeight = ''
        charCountDisplay.style.color = '#666' // 기본 회색
      }
    }

    // 글자수 업데이트
    if (charCountDisplay) {
      charCountDisplay.innerText = `${inputContents.value.length} / 1000`
    }

    if (titleCheck && contentsCheck) {
      submit.style.backgroundColor = '#007aff'
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

  async loadPostData() {
    const urlParams = new URLSearchParams(window.location.search)
    this.postId = Number(urlParams.get('id'))

    if (!this.postId) {
      console.error('해당 ID의 포스트를 찾을 수 없습니다.')
      return
    }

    this.postData = await getPostDetail(this.postId)
    this.postImg = this.postData.post_img
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}

customElements.define('post-form-element', postFormElement)
