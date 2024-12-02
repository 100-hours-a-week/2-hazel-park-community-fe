const baseUrl = 'http://3.35.112.49:3000/api/posts'

export async function uploadPost(title, writer, updatedAt, contents, postImg) {
  const formData = new FormData()
  formData.append('title', title)
  formData.append('writer', writer)
  formData.append('updated_at', updatedAt)
  formData.append('contents', contents)

  if (postImg) {
    const base64Data = postImg.split(',')[1]
    const blob = await fetch(postImg).then((res) => res.blob())
    formData.append('post_img', blob, 'postImg.jpg')
  }

  try {
    const response = await fetch(`${baseUrl}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })

    const data = await response.json()
    console.log(data.message)
    console.log(data.user)
  } catch (error) {
    alert(error.message)
  }
}

export async function getPosts({ page = 0, limit = 4 } = {}) {
  try {
    const response = await fetch(`${baseUrl}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    console.log(data.posts)
    return data.posts
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

export async function patchPost(postId, title, content, updatedAt, postImg) {
  const formData = new FormData()
  formData.append('title', title)
  formData.append('content', content)
  formData.append('updated_at', updatedAt)

  if (postImg) {
    const base64Data = postImg.split(',')[1]
    const blob = await fetch(postImg).then((res) => res.blob())
    formData.append('post_img', blob, 'postImg.jpg')
  }

  try {
    const response = await fetch(`${baseUrl}/${postId}`, {
      method: 'PATCH',
      credentials: 'include',
      body: formData,
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
      credentials: 'include',
    })
    alert('게시글이 삭제되었습니다.')
  } catch (error) {
    alert(error.message)
  }
}

export async function likes(postId, is_liked) {
  try {
    const response = await fetch(`${baseUrl}/${postId}/likes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_liked,
      }),
    })

    const data = await response.json()
    console.log(data.message)
    return data.post_likes
  } catch (error) {
    alert(error.message)
  }
}
