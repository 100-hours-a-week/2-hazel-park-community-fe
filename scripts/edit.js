document.addEventListener('DOMContentLoaded', async () => {
  const header = document.querySelector('header-element')
  const loadingScreen = document.getElementById('loading-screen')

  // 모든 데이터 패치가 완료될 때까지 기다림
  await Promise.all([header.fetchData()])

  // 로딩 화면 제거
  if (loadingScreen) {
    loadingScreen.style.opacity = '0'
    setTimeout(() => {
      loadingScreen.remove()
    }, 1000) // 페이드아웃 시간과 동일하게 설정
  }
})
