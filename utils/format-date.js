export const formatDate = (time) => {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export const formatCommentDate = (time) => {
  const date = new Date(time)
  const year = date.getUTCFullYear()
  const monthNumber = date.getUTCMonth()

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const month = monthNames[monthNumber]

  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')

  if (hours > 12) {
    return `${month} ${day}, ${year}`
  } else if (hours <= 12) {
    return `${month} ${day}, ${year}`
  }
}

export const formatTime = (time) => {
  const date = new Date(time)
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')

  if (hours > 12) {
    return `PM ${hours}:${minutes}`
  } else if (hours <= 12) {
    return `AM ${hours}:${minutes}`
  }
}
