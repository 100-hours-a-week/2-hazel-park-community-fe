document.addEventListener('DOMContentLoaded', () => {
  const signInTxt = document.getElementById('sign-in')
  const inputEmail = document.getElementById('input-email')
  const inputPassword = document.getElementById('input-password')
  const submit = document.getElementById('submit')
  let emailHyperText = document.getElementById('email-hyper-text')
  let pwHyperText = document.getElementById('pw-hyper-text')
  let emailCheck = false
  let pwCheck = false

  if (submit) {
    submit.addEventListener('click', (event) => {
      event.preventDefault()

      emailHyperText.innerText = ''
      pwHyperText.innerText = ''

      if (
        !inputEmail.value.trim() ||
        !emailValidCheck(inputEmail.value.trim())
      ) {
        emailHyperText.innerText = '올바른 이메일 주소 형식을 입력해주세요.'
        emailHyperText.style.visibility = 'visible'
      } else {
        emailCheck = true
      }

      if (!inputPassword.value.trim()) {
        pwHyperText.style.visibility = 'visible'
        pwHyperText.innerText = '비밀번호를 입력해주세요.'
      } else if (!pwValidCheck(inputPassword.value.trim())) {
        pwHyperText.innerText =
          '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
        pwHyperText.style.visibility = 'visible'
      } else {
        pwCheck = true
      }

      if (emailCheck && pwCheck) {
        submit.style.backgroundColor = '#7f6aee'
        submit.style.cursor = 'pointer'
      }
    })
  }

  if (signInTxt) {
    signInTxt.addEventListener('click', () =>
      handleNavigation('/2-hazel-park-community-fe/html/Sign-in.html'),
    )
  }

  function emailValidCheck(email) {
    const pattern = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-za-z0-9\-]+/

    if (pattern.test(email) === false) {
      console.log('false')
      return false
    } else {
      console.log('true')
      return true
    }
  }

  function pwValidCheck(value) {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/.test(
      value,
    )
  }

  function handleNavigation(url) {
    window.location.href = url
  }
})
