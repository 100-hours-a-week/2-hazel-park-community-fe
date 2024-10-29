class postFormElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.isMakePostPage = true
  }

  connectedCallback() {
    this.checkLocation()
    this.shadowRoot.innerHTML = this.template()
  }

  template() {
    return `
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
                    '<div id="img-hyper-text" style="height: 1.7em; visibility: hidden;" class="hyper-text"></div>' +
                    '<input id="input-profile-img" type="file" class="input-profile-img" accept="image/*" />' +
                    '</div>' +
                    '<div class="email-wrap">' +
                    '<div class="input-title">내용*</div>' +
                    '<textarea id="input-content" type="text" placeholder="내용을 입력해주세요." class="input-value input-value-textarea"></textarea>' +
                    '</div>' +
                    '<div style="margin-top: 1rem" class="nickname-wrap">' +
                    '<div class="input-title">이미지</div>' +
                    '<div class="input-file-wrap"><input id="input-nickname" type="file" class="input-value-file"/>' +
                    '<label for="input-nickname" class="input-file-label">파일 선택</label>' +
                    '<span class="input-file-span">파일을 선택해주세요.</span>' +
                    '</div>' +
                    '<div id="nickname-hyper-text" style="height: 1.5rem" class="hyper-text"></div>' +
                    '</div>'
                  : '<div style="margin-top: 0.3em" class="password-wrap">' +
                    '<div class="input-title">비밀번호</div>' +
                    '<input id="input-password" type="password" placeholder="비밀번호를 입력하세요" class="input-value" />' +
                    '<div id="pw-hyper-text" style="height: 2.2em" class="hyper-text"></div>' +
                    '</div>' +
                    '<div style="margin-top: 0.3em" class="password-wrap">' +
                    '<div class="input-title">비밀번호 확인*</div>' +
                    '<input id="input-re-password" type="password" placeholder="비밀번호를 한번 더입력하세요" class="input-value" />' +
                    '<div id="re-pw-hyper-text" style="height: 1.7em" class="hyper-text"></div>' +
                    '</div>'
              }           
                <input id="submit" type="submit" value="완료" class="make-post-submit" />
            </form>
        </div>`
  }

  checkLocation() {
    const currentPath = window.location.pathname
    if (currentPath === '/html/make-post.html') {
      this.isMakePostPage = true
    } else {
      this.isMakePostPage = false
    }
  }
}

customElements.define('post-form-element', postFormElement)
