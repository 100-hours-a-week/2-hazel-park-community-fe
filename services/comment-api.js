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

export async function uploadComment(postId, writer, updatedAt, content) {
  try {
    const response = await fetch(`${baseUrl}/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        writer,
        updatedAt,
        content,
      }),
    })

    const data = await response.json()
    console.log(data.message)
  } catch (error) {
    console.log(error.message)
  }
}

export async function editComments(postId, commentId, content, updatedAt) {
  try {
    const response = await fetch(`${baseUrl}/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId,
        content,
        updatedAt,
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    alert(error.message)
    return []
  }
}

export async function deleteComments(postId, commentId) {
  try {
    const response = await fetch(`${baseUrl}/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId,
      }),
    })

    const data = await response.json()
    console.log(data.message)
  } catch (error) {
    console.log(error.message)
  }
}
