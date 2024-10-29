document.addEventListener('DOMContentLoaded', () => {
  const signInTxt = document.getElementById('sign-in')

  if (signInTxt) {
    signInTxt.addEventListener('click', () =>
      handleNavigation('/html/Sign-in.html'),
    )
  }

  function handleNavigation(url) {
    window.location.href = url
  }
})
