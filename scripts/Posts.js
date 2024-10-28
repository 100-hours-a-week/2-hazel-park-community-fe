document.addEventListener('DOMContentLoaded', () => {
  const postBtn = document.getElementById('add-post-button')

  if (postBtn) {
    postBtn.addEventListener('click', handlePostBtn)
  }

  function handlePostBtn() {
    window.location.href = '/2-hazel-park-community-fe/html/make-post.html'
  }
})
