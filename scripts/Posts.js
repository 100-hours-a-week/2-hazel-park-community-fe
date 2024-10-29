document.addEventListener('DOMContentLoaded', () => {
  const postBtn = document.getElementById('add-post-button')

  if (postBtn) {
    postBtn.addEventListener('click', handlePostBtn)
  }

  function handlePostBtn() {
    window.location.href = '/html/make-post.html'
  }
})
