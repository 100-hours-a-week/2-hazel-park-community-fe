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

function handlePostItem() {
  window.location.href = '/2-hazel-park-community-fe/html/post.html'
}
