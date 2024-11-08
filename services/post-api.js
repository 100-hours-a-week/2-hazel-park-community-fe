const baseUrl = 'http://localhost:3000/api/posts'

export async function uploadPost(
  title,
  writer,
  updatedAt,
  contents,
  likes,
  views,
  comments,
  postImg,
) {
  const formData = new FormData()
  formData.append('title', title)
  formData.append('writer', writer)
  formData.append('updatedAt', updatedAt)
  formData.append('contents', contents)
  formData.append('likes', likes)
  formData.append('views', views)
  formData.append('comments', comments)

  if (postImg) {
    const base64Data = postImg.split(',')[1]
    const blob = await fetch(postImg).then((res) => res.blob())
    formData.append('postImg', blob, 'postImg.jpg')
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

export async function patchPost(postId, title, content, updatedAt, postImg) {
  const formData = new FormData()
  formData.append('title', title)
  formData.append('content', content)
  formData.append('updatedAt', updatedAt)

  if (postImg) {
    const base64Data = postImg.split(',')[1]
    const blob = await fetch(postImg).then((res) => res.blob())
    formData.append('postImg', blob, 'postImg.jpg')
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

    const data = await response.json()
    console.log(data.message)
  } catch (error) {
    alert(error.message)
  }
}

export async function likes(postId, isLiked) {
  try {
    const response = await fetch(`${baseUrl}/${postId}/likes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isLiked,
      }),
    })

    const data = await response.json()
    console.log(data.message)
    return data.post_likes
  } catch (error) {
    alert(error.message)
  }
}
