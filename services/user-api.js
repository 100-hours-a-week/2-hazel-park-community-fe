const baseUrl = 'http://localhost:3000/api/users'

export async function loginUser(email, password) {
  try {
    const response = await fetch(`${baseUrl}/login`, {
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
    formData.append('profilePic', blob, 'profile.jpg')
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
    formData.append('newProfileImg', blob, 'newProfile.jpg')
  }

  try {
    const response = await fetch(`${baseUrl}/userInfo`, {
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
    const response = await fetch(`${baseUrl}/patchPw`, {
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
    const response = await fetch(`${baseUrl}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
    })

    const data = await response.json()
    console.log(data.message)
  } catch (error) {
    alert(error.message)
  }
}

export async function logoutUser() {
  try {
    const response = await fetch(`${baseUrl}/logout`, {
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
