import handleNavigation from '../utils/navigation.js'

document.addEventListener('DOMContentLoaded', () => {
  const postBtn = document.getElementById('add-post-button')

  if (postBtn) {
    postBtn.addEventListener('click', () =>
      handleNavigation('/html/make-post.html'),
    )
  }
})
