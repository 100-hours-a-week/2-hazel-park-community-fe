const baseUrl = 'http://43.202.43.192:3000/api/users'
const authUrl = 'http://43.202.43.192:3000/api/auth'

export async function loginUser(email, password) {
  try {
    const response = await fetch(`${authUrl}/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await response.json()
    localStorage.setItem('user', JSON.stringify(data.user))
    return data.user
  } catch (error) {
    console.log(error)
    alert(error.message)
  }
}

export async function registerUser(email, password, nickname, profilePic) {
  const formData = new FormData()
  formData.append('email', email)
  formData.append('password', password)
  formData.append('nickname', nickname)

  if (profilePic) {
    const base64Data = profilePic.split(',')[1]
    const blob = await fetch(profilePic).then((res) => res.blob())
    formData.append('profile_pic', blob, 'profile.jpg')
  }

  try {
    const response = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    console.log(data.message)
    return data.message
  } catch (error) {
    alert(error.message)
  }
}

export async function patchUserNickname(email, nickname, newImageData) {
  const formData = new FormData()
  formData.append('email', email)
  formData.append('nickname', nickname)

  if (newImageData) {
    const base64Data = newImageData.split(',')[1]
    const blob = await fetch(newImageData).then((res) => res.blob())
    formData.append('new_profile_img', blob, 'newProfile.jpg')
  }

  try {
    const response = await fetch(`${baseUrl}/info`, {
      method: 'PATCH',
      body: formData,
    })

    return response.status
  } catch (error) {
    alert(error.message)
  }
}

export async function patchUserPw(email, password) {
  try {
    const response = await fetch(`${baseUrl}/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await response.json()
    console.log(data.message)
  } catch (error) {
    alert(error.message)
  }
}

export async function deleteUser(email) {
  try {
    const response = await fetch(`${baseUrl}/${email}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    alert('회원 탈퇴에 성공하였습니다.')
  } catch (error) {
    alert(error.message)
  }
}

export async function logoutUser() {
  try {
    const response = await fetch(`${authUrl}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    console.log(data.message)
  } catch (error) {
    alert(error.message)
  }
}
