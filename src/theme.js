import { ref } from 'vue'

// 전역 테마 상태 — 헤더 토글(App.vue)과 각 페이지가 공유한다.
// true = 다크, false = 라이트
export const isDarkTheme = ref(true)
