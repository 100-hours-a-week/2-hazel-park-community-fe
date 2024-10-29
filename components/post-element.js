import checkCount from '../utils/check-count.js'
import handleNavigation from '../utils/navigation.js'

class PostElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = this.template()
  }

  template() {
    return `
        <link rel="stylesheet" href="../styles/post.css" />
        <section class="post">
            <article class="post-detail-top">
              <div class="post-title">제목</div>
              <div class="post-title-detail-wrap">
                <div class="post-writer-img"></div>
                <div class="post-writer-name">작성자</div>
                <div class="post-updateAt">yyyy-mm-dd hh:mm:ss</div>
                <div class="post-controll-button">
                  <button id="button-update" class="post-controll-button-detail">
                    수정
                  </button>
                  <button id="button-delete" class="post-controll-button-detail">
                    삭제
                  </button>
                </div>
              </div>
            </article>
            <article class="post-detail-bottom">
              <div class="post-contents-img"></div>
              <div class="post-contents">
                무엇을 얘기할까요? 아무말이라면, 삶은 항상 놀라운 모험이라고
                생각합니다. 우리는 매일 새 로운 경험을 하고 배우며 성장합니다. 때로는
                어려움과 도전이 있지만, 그것들이 우리를 더 강 하고 지혜롭게 만듭니다.
                또한 우리는 주변의 사람들과 연결되며 사랑과 지지를 받습니다. 그래 서
                우리의 삶은 소중하고 의미가 있습니다. 자연도 아름다운 이야기입니다.
                우리 주변의 자연은 끝없는 아름다움과 신비로움을 담고 있습 니다. 산,
                바다, 숲, 하늘 등 모든 것이 우리를 놀라게 만들고 감동시킵니다. 자연은
                우리의 생명 과 안정을 지키며 우리에게 힘을 주는 곳입니다. 마지막으로,
                지식을 향한 탐구는 항상 흥미로운 여정입니다. 우리는 끝없는 지식의
                바다에서 배 우고 발견할 수 있으며, 이것이 우리를 더 깊이 이해하고
                세상을 더 넓게 보게 해줍니다. 그런 의미에서, 삶은 놀라움과
                경이로움으로 가득 차 있습니다. 새로운 경험을 즐기고 항상 앞 으로
                나아가는 것이 중요하다고 생각합니다.
              </div>
              <div class="post-interaction">
                <div class="post-interaction-box">
                  <div class="post-interaction-value">${checkCount(1000)}</div>
                  <div class="post-interaction-title">좋아요</div>
                </div>
                <div class="post-interaction-box">
                  <div class="post-interaction-value">${checkCount(10000)}</div>
                  <div class="post-interaction-title">조회수</div>
                </div>
                <div class="post-interaction-box">
                  <div class="post-interaction-value">${checkCount(100000)}</div>
                  <div class="post-interaction-title">댓글</div>
                </div>
              </div>
            </article>
        </section>
    `
  }
}

customElements.define('post-element', PostElement)
