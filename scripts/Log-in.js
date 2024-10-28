document.addEventListener('DOMContentLoaded', () => {
  const signInTxt = document.getElementById('sign-in')
  const inputEmail = document.getElementById('input-email')
  const inputPassword = document.getElementById('input-password')
  const submit = document.getElementById('submit')
  let emailHyperText = document.getElementById('email-hyper-text')
  let pwHyperText = document.getElementById('pw-hyper-text')

  function validateForm() {
    let emailCheck = false
    let pwCheck = false

    if (!inputEmail.value.trim() || !emailValidCheck(inputEmail.value.trim())) {
      emailHyperText.innerText = '올바른 이메일 주소 형식을 입력해주세요.'
      emailHyperText.style.visibility = 'visible'
    } else {
      emailCheck = true
      emailHyperText.style.visibility = 'hidden'
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
      pwHyperText.style.visibility = 'hidden'
    }

    if (emailCheck && pwCheck) {
      submit.style.backgroundColor = '#7f6aee'
      submit.style.cursor = 'pointer'
      return true
    }
  }

  if (submit) {
    submit.addEventListener('click', (event) => {
      event.preventDefault()
      if (validateForm()) {
        // TODO: 추후 로그인 api 연동 추가
        handleNavigation('/2-hazel-park-community-fe/html/Posts.html')
      }
    })
  }

  if (signInTxt) {
    signInTxt.addEventListener('click', () =>
      handleNavigation('/2-hazel-park-community-fe/html/Sign-in.html'),
    )
  }

  inputEmail.addEventListener('input', validateForm)
  inputPassword.addEventListener('input', validateForm)

  function emailValidCheck(email) {
    const pattern = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+$/
    return pattern.test(email)
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
