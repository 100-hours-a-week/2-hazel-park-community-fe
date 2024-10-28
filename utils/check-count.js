export default function checkCount(count) {
  if (count >= 1000) {
    return '1k'
  } else if (count >= 10000) {
    return '10k'
  } else if (count >= 100000) {
    return '100k'
  } else {
    return count
  }
}
