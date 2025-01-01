const baseUrl = '/api/users'
const authUrl = '/api/auth'

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
    if (data.user) {
      return data.user
    } else {
      return null
    }
  } catch (error) {
    alert(error.message)
  }
}

export async function getSessionUser() {
  try {
    const response = await fetch(`${baseUrl}/user-session`, {
      method: 'GET',
      credentials: 'include', // 쿠키 포함
    })

    if (response.ok) {
      const data = await response.json()
      return data.user // 세션 사용자 정보 반환
    } else {
      return null // 세션이 유효하지 않으면 null 반환
    }
  } catch (error) {
    console.error('세션 사용자 확인 실패:', error)
    return null
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
      credentials: 'include',
      body: formData,
    })

    const data = await response.json()
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
      credentials: 'include',
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
  } catch (error) {
    alert(error.message)
  }
}

export async function deleteUser(email) {
  try {
    const response = await fetch(`${baseUrl}/${email}`, {
      method: 'DELETE',
      credentials: 'include',
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
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
  } catch (error) {
    alert(error.message)
  }
}
