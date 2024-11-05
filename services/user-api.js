const baseUrl = 'http://localhost:3000/api/users'

export async function loginUser(email, password) {
  try {
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await response.json()
    return data.user
  } catch (error) {
    console.log(error)
    alert(error.message)
  }
}

export async function registerUser(email, password, nickname) {
  try {
    const response = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        nickname,
      }),
    })

    const data = await response.json()
    console.log(data.message)
    return data.message
  } catch (error) {
    alert(error.message)
  }
}

export async function patchUserNickname(email, nickname) {
  try {
    const response = await fetch(`${baseUrl}/patchName`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        nickname,
      }),
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
