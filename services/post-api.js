const baseUrl = 'http://localhost:3000/api/posts'

export async function uploadPost(
  title,
  writer,
  updatedAt,
  contents,
  likes,
  views,
  comments,
) {
  try {
    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        writer,
        updatedAt,
        contents,
        likes,
        views,
        comments,
      }),
    })

    const data = await response.json()
    console.log(data.message)
    console.log(data.user)
  } catch (error) {
    alert(error.message)
  }
}

export async function getPosts() {
  try {
    const response = await fetch(`${baseUrl}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    alert(error.message)
    return []
  }
}

export async function getPostDetail(postId) {
  try {
    const response = await fetch(`${baseUrl}/postDetail/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    alert(error.message)
    return []
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
