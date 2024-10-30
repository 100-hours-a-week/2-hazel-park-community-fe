export default function saveDataInLocalStorage(
  type,
  email,
  password,
  nickname,
) {
  const data = {
    user_email: email,
    user_pw: password,
    user_name: nickname,
  }

  if (type === 'user') {
    localStorage.setItem('user', JSON.stringify(data))
  } else if (type === 'post') {
    const post = {
      post_title: memoTitle,
      post_writer: memoContent,
      post_updatedAt: '',
      post_contents: '',
      post_likes: '',
      post_views: '',
      post_comments: '',
    }
    localStorage.setItem('post', JSON.stringify(post))
  } else if (type === 'comment') {
    const comment = {
      comment_writer: memoTitle,
      comment_updatedAt: memoContent,
      comment_contents: '',
    }
    localStorage.setItem('comment', JSON.stringify(comment))
  }
}
