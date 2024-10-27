import checkCount from '../utils/check-count.js'

document.addEventListener('DOMContentLoaded', () => {
  const postBtn = document.getElementById('add-post-button')
  const profileImg = document.getElementById('profile-img')
  const profileDropdown = document.getElementById('profile-dropdown')
  const profileDropdownEditProfile = document.getElementById(
    'profile-dropdown-edit-profile',
  )
  const profileDropdownEditPassword = document.getElementById(
    'profile-dropdown-edit-password',
  )

  if (postBtn) {
    postBtn.addEventListener('click', handlePostBtn)
  }
  if (profileImg) {
    profileImg.addEventListener('click', () => {
      profileDropdown.style.visibility =
        profileDropdown.style.visibility === 'visible' ? 'hidden' : 'visible'
    })
  }
  if (profileImg) {
    document.addEventListener('click', (event) => {
      if (!profileImg.contains(event.target)) {
        profileDropdown.style.visibility = 'hidden'
      }
    })
  }
})

function handlePostBtn() {
  window.location.href = '/2-hazel-park-community-fe/html/make-post.html'
}

class PostElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
  }

  disconnectedCallback() {
    // 컴포넌트가 DOM에서 제거될 때 수행할 작업이 있다면 여기에 작성
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    // 속성 값이 변경될 때 수행할 작업이 있다면 여기에 작성
  }

  adoptedCallback() {
    // 컴포넌트가 새로운 DOM으로 이동될 때 수행할 작업이 있다면 여기에 작성
  }

  render() {
    const posts = [
      {
        id: 1,
        title: '첫 번째 게시글의최대제목수수수',
        likes: 1000,
        comments: 10000,
        views: 100000,
        updateAt: '2024-10-26 22:25:00',
        writer: 'user1',
      },
      {
        id: 2,
        title: '두 번째 게시글',
        likes: 0,
        comments: 2,
        views: 3,
        updateAt: '2024-10-26 22:24:01',
        writer: 'user2',
      },
      {
        id: 3,
        title: '세 번째 게시글',
        likes: 3,
        comments: 1,
        views: 5,
        updateAt: '2024-10-26 22:20:10',
        writer: 'user3',
      },
    ]

    this.shadowRoot.innerHTML = this.template(posts)

    const postItems = this.shadowRoot.querySelectorAll('.post-item')
    postItems.forEach((item) => {
      item.addEventListener('click', handlePostItem)
    })
  }

  template(posts) {
    return `
        <link rel="stylesheet" href="../styles/Posts.css" />
        <div class="post-list">
          ${posts
            .map(
              (post) => `
                <div class="post-item">
                    <div class="post-info-wrap">
                        <div class="post-info-wrap-left">
                            <div class="post-title">${post.title}</div>
                            <div class="post-wrap-detail">
                                <div class="post-likes">좋아요 ${checkCount(post.likes)}</div>
                                <div class="post-comment">댓글 ${checkCount(post.comments)}</div>
                                <div class="post-views">조회수 ${checkCount(post.views)}</div>                        
                            </div>
                        </div>
                        <div class="post-updateAt">${post.updateAt}</div>
                    </div>
                    <div class="post-writer-wrap">
                      <div class="post-writer-img"></div>
                      <div class="post-writer">${post.writer}</div>                  
                    </div>
                </div>
              `,
            )
            .join('')}
        </div>
      `
  }
}

function handlePostItem() {
  window.location.href = '/2-hazel-park-community-fe/html/post.html'
}

customElements.define('post-element', PostElement)
