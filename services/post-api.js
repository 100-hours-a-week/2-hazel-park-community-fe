const baseUrl = '/api/posts'
import handleNavigation from '/utils/navigation.js'

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

    if (!response.ok) {
      const result = await response.json()
      if (response.status === 429) {
        alert('잠시 후 다시 시도해 주세요!')
      } else {
        alert(result.message)
      }
      return
    }
  } catch (error) {}
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
    if (data.message === '게시글이 존재하지 않습니다.') {
      alert(data.message)
      return handleNavigation('/html/Posts.html')
    }
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

  if (postImg !== null) {
    const base64Data = postImg.split(',')[1]
    const blob = await fetch(postImg).then((res) => res.blob())
    formData.append('post_img', blob, 'postImg.jpg')
  } else {
    formData.append('post_img', 'null')
  }

  try {
    const response = await fetch(`${baseUrl}/${postId}`, {
      method: 'PATCH',
      credentials: 'include',
      body: formData,
    })

    const data = await response.json()
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
    return data.post_likes
  } catch (error) {
    alert(error.message)
  }
}
