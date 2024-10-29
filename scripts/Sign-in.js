document.addEventListener('DOMContentLoaded', () => {
  const logInTxt = document.getElementById('log-in')

  if (logInTxt) {
    logInTxt.addEventListener('click', () =>
      handleNavigation('/html/Log-in.html'),
    )
  }

  function handleNavigation(url) {
    window.location.href = url
  }
})
