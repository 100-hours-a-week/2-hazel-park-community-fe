document.addEventListener('DOMContentLoaded', () => {
  const postBtn = document.getElementById('add-post-button')
  const profileImg = document.getElementById('profile-img')
  const profileDropdown = document.getElementById('profile-dropdown')
  const dropdownEditProfile = document.getElementById('dropdown-edit-profile')
  const dropdownEditPassword = document.getElementById('dropdown-edit-password')
  const dropdownLogout = document.getElementById('dropdown-logout')

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

  if (profileImg) {
    document.addEventListener('click', (event) => {
      if (!profileImg.contains(event.target)) {
        profileDropdown.style.visibility = 'hidden'
      }
    })
  }

  if (dropdownEditProfile) {
    dropdownEditProfile.addEventListener('click', handleDropdownEditProfile)
  }

  if (dropdownEditPassword) {
    dropdownEditPassword.addEventListener('click', handleDropdownEditPassword)
  }

  if (dropdownLogout) {
    dropdownLogout.addEventListener('click', handleDropdownLogout(profileImg))
  }
})

function handlePostBtn() {
  window.location.href = '/2-hazel-park-community-fe/html/make-post.html'
}

function handlePostItem() {
  window.location.href = '/2-hazel-park-community-fe/html/post.html'
}

function handleDropdownEditProfile() {
  window.location.href = '/2-hazel-park-community-fe/html/edit-profile.html'
}

function handleDropdownEditPassword() {
  window.location.href = '/2-hazel-park-community-fe/html/edit-password.html'
}

function handleDropdownLogout(profileImg) {
  if (profileImg) {
    profileImg.style.visibility = 'hidden'
  }
}
