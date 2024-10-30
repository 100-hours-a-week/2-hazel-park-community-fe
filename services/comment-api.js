const baseUrl = 'http://localhost:3000/api/comments'

export async function getComments(postId) {
  try {
    const response = await fetch(`${baseUrl}/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    console.log(data.message)
    return data
  } catch (error) {
    alert(error.message)
    return []
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
    const response = await fetch(`${baseUrl}/${postId}`, {
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

export async function patchPost(postId, title, content, updatedAt) {
  try {
    const response = await fetch(`${baseUrl}/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        content,
        updatedAt,
      }),
    })

    const data = await response.json()
    console.log(data.message)
  } catch (error) {
    alert(error.message)
  }
}

export async function deletePost(postId) {
  try {
    const response = await fetch(`${baseUrl}/${postId}`, {
      method: 'DELETE',
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
