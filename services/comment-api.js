const baseUrl = '/api/comments'
const postUrl = '/api/posts'

export async function getComments({ postId, page = 0, limit = 2 } = {}) {
  try {
    const response = await fetch(
      `${postUrl}/${postId}/comments?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    const data = await response.json()
    return data
  } catch (error) {
    alert(error.message)
    return []
  }
}

export async function uploadComment(postId, writer, updated_at, content) {
  try {
    const response = await fetch(`${postUrl}/${postId}/comment`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        writer,
        updated_at,
        content,
      }),
    })

    return await response.json()
  } catch (error) {
    if ((error.status = 429)) {
      alert('잠시 후 다시 시도해 주세요!')
    }
  }
}

export async function editComments(postId, commentId, content, updated_at) {
  try {
    const response = await fetch(`${baseUrl}/${commentId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId,
        content,
        updated_at,
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    if ((error.status = 429)) {
      alert('잠시 후 다시 시도해 주세요!')
    } else {
      alert(error.message)
    }
    return []
  }
}

export async function deleteComments(postId, commentId) {
  try {
    const response = await fetch(`${postUrl}/${postId}/${commentId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {}
}
