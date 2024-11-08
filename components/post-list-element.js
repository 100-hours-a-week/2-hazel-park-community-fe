import checkCount from '../utils/check-count.js'
import handleNavigation from '../utils/navigation.js'
import { getPosts } from '../services/post-api.js'

class PostListElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.posts = []
  }

  async connectedCallback() {
    this.loadPostsData()
  }

  async loadPostsData() {
    this.posts = await getPosts()
    this.render()
  }

  render() {
    const posts = Array.isArray(this.posts) ? this.posts : [this.posts]
    console.log(posts)

    this.shadowRoot.innerHTML = this.template(posts)

    const postItems = this.shadowRoot.querySelectorAll('.post-item')
    postItems.forEach((item, index) => {
      const postId = posts[index].post_id
      item.dataset.id = postId
      item.addEventListener('click', () =>
        handleNavigation(`/html/post.html?id=${postId}`),
      )
    })
  }

  template(posts) {
    return `
          <link rel="stylesheet" href="../styles/Posts.css" />
          <div class="post-list">
            ${posts
              .reverse()
              .map(
                (post) => `
                  <div class="post-item">
                      <div class="post-info-wrap">
                          <div class="post-info-wrap-left">
                              <div class="post-title">${post.post_title}</div>
                              <div class="post-wrap-detail">
                                  <div class="post-likes">좋아요 ${checkCount(post.post_likes)}</div>
                                  <div class="post-comment">댓글 ${checkCount(post.post_comments)}</div>
                                  <div class="post-views">조회수 ${checkCount(post.post_views)}</div>                        
                              </div>
                          </div>
                          <div class="post-updateAt">${post.post_updatedAt.toLocaleString()}</div>
                      </div>
                      <div class="post-writer-wrap">
                      ${
                        post.author_profile_picture
                          ? `
                            <img id="post-writer-img" src="${post.author_profile_picture}" class="post-writer-profile" />
                            `
                          : `
                            <div id="post-writer-div" class="post-writer-img"></div>
                            `
                      }
                        
                        <div class="post-writer">${post.post_writer}</div>                  
                      </div>
                  </div>
                `,
              )
              .join('')}
          </div>
        `
  }
}

customElements.define('post-list-element', PostListElement)
