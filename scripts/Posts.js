document.addEventListener('DOMContentLoaded', () => {
  const postBtn = document.getElementById('add-post-button')
  const profileImg = document.getElementById('profile-img')
  const profileDropdown = document.getElementById('profile-dropdown')
  const dropdownEditProfile = document.getElementById('dropdown-edit-profile')
  const dropdownEditPassword = document.getElementById('dropdown-edit-password')
  const dropdownLogin = document.getElementById('dropdown-login')
  const dropdownLogout = document.getElementById('dropdown-logout')

  let isLogin = true

  function updateProfileStatus() {
    if (profileImg) {
      profileImg.src = isLogin
        ? '../assets/admin.png'
        : '../assets/pre-profile.png'
    }
    if (profileDropdown) {
      dropdownLogin.style.display = isLogin ? 'none' : 'block'
      dropdownLogout.style.display = isLogin ? 'block' : 'none'
    }
  }

  updateProfileStatus()

  if (postBtn) {
    postBtn.addEventListener('click', handlePostBtn)
  }

  if (profileImg) {
    profileImg.addEventListener('click', (event) => {
      event.stopPropagation()
      profileDropdown.style.visibility =
        profileDropdown.style.visibility === 'visible' ? 'hidden' : 'visible'
    })
  }

  document.addEventListener('click', (event) => {
    if (profileImg && !profileImg.contains(event.target)) {
      profileDropdown.style.visibility = 'hidden'
    }
  })

  if (dropdownEditProfile) {
    dropdownEditProfile.addEventListener('click', handleDropdownEditProfile)
  }

  if (dropdownEditPassword) {
    dropdownEditPassword.addEventListener('click', handleDropdownEditPassword)
  }

  if (dropdownLogin) {
    dropdownLogin.addEventListener('click', handleDropdownLogin)
  }

  if (dropdownLogout) {
    dropdownLogout.addEventListener('click', () => {
      isLogin = false
      updateProfileStatus()
    })
  }

  function handlePostBtn() {
    window.location.href = '/2-hazel-park-community-fe/html/make-post.html'
  }

  function handleDropdownEditProfile() {
    window.location.href = '/2-hazel-park-community-fe/html/edit-profile.html'
  }

  function handleDropdownEditPassword() {
    window.location.href = '/2-hazel-park-community-fe/html/edit-password.html'
  }

  function handleDropdownLogin() {
    window.location.href = '/2-hazel-park-community-fe/html/Log-in.html'
  }
})
