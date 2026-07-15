<template>
  <div id="app">
    <header class="app-header">
      <div class="brand">
        <router-link to="/">Seoul Explorer</router-link>
      </div>

      <div class="header-actions">
        <button class="theme-toggle" type="button" @click="toggleTheme" :aria-pressed="!isDarkTheme">
          <span class="theme-toggle__icon">{{ isDarkTheme ? '☀️' : '🌙' }}</span>
          <span>{{ isDarkTheme ? '라이트 모드' : '다크 모드' }}</span>
        </button>

        <nav class="main-nav">
          <router-link to="/categories">지역정보</router-link>
          <router-link to="/community">커뮤니티</router-link>
          <router-link to="/map">지도</router-link>
        </nav>
      </div>
    </header>

    <main class="app-body">
      <router-view />
    </main>

    <footer class="app-footer">
      <p>서울 관광 정보, 커뮤니티, 지도, 챗봇을 한 곳에서</p>
    </footer>

    <ChatWidget />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import ChatWidget from './components/chat/ChatWidget.vue'

const isDarkTheme = ref(true)

const applyTheme = (dark) => {
  isDarkTheme.value = dark
  document.documentElement.classList.toggle('theme-light', !dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

const toggleTheme = () => {
  applyTheme(!isDarkTheme.value)
}

onMounted(() => {
  const storedTheme = localStorage.getItem('theme')
  if (storedTheme) {
    applyTheme(storedTheme === 'dark')
    return
  }

  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
  applyTheme(!prefersLight)
})
</script>

<style>
:root {
  color-scheme: dark;
  font-family: 'Noto Sans KR', sans-serif;
  
  /* [Dark Theme] - 푸른빛을 빼고 깊은 숲속/차콜 톤으로 변경 */
  --bg: #0d1510;                         /* 어두운 초록빛 블랙 */
  --surface: rgba(20, 34, 25, 0.95);     /* 헤더/네비바 배경 */
  --surface-strong: #1b2e22;             /* 푸터 배경 */
  --card-bg: rgba(255, 255, 255, 0.04);   /* 카드 배경 (다크모드용 반투명) */
  
  /* 텍스트 & 경계선 */
  --text: #f0f7f4;                       /* 살짝 초록빛이 도는 밝은 텍스트 */
  --text-muted: #a3b899;                 /* 톤다운된 보조 텍스트 */
  --muted: #708573;                      /* 어두운 보조 텍스트 */
  --border: rgba(255, 255, 255, 0.08);   /* 섬세한 경계선 */
  --shadow: rgba(0, 0, 0, 0.4);          /* 짙은 그림자 */
  
  /* 포인트 컬러 (Forest Green 계열) */
  --link: #cbd5e1;
  --active: #4ade80;                     /* 활성화 링크 (밝은 초록) */
  --accent: #22c55e;                     /* 메인 초록 */
  --accent-strong: #16a34a;              /* 강조 초록 */
  --accent-soft: rgba(34, 197, 94, 0.15); /* 버튼 등의 연한 배경 */
}

html.theme-light {
  color-scheme: light;
  
  /* [Light Theme] - 눈이 편안한 그린 계열의 화이트 톤 */
  --bg: #f3f9f5;                         /* 부드러운 연두빛 화이트 */
  --surface: #ffffff;                    /* 헤더는 깔끔한 화이트 */
  --surface-strong: #e8f3ec;             /* 푸터는 밝은 올리브 그레이 */
  --card-bg: #ffffff;                    /* 카드가 돋보이도록 순백색 지정 */
  
  /* 텍스트 & 경계선 */
  --text: #14291c;                       /* 깊은 초록빛의 블랙 */
  --text-muted: #4e6b5a;                 /* 부드러운 카키/그린 그레이 */
  --muted: #769482;                      /* 보조 텍스트 */
  --border: rgba(22, 101, 52, 0.12);     /* 연한 초록빛 경계선 */
  --shadow: rgba(22, 101, 52, 0.06);     /* 은은한 초록빛 그림자 */
  
  /* 포인트 컬러 */
  --link: #1b4332;
  --active: #15803d;                     /* 활성화 링크 (짙은 초록) */
  --accent: #22c55e;
  --accent-strong: #16a34a;
  --accent-soft: rgba(34, 197, 94, 0.1);
}

/* Base Styles */
html, body, #app {
  min-height: 100vh;
  margin: 0;
  background: var(--bg);
  color: var(--text);
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

body {
  background: var(--bg);
  color: var(--text);
}

/* App Header */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 2rem;
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--border);
  box-shadow: 0 10px 30px var(--shadow);
  backdrop-filter: blur(8px); /* 헤더 뒷배경 블러 처리로 더욱 고급스럽게 */
  transition: background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.brand a {
  color: var(--text);
  font-size: 1.4rem;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: -0.03em;
}

/* Theme Toggle Button */
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--text);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  transform: translateY(-1px);
  border-color: var(--accent);
  background: rgba(34, 197, 94, 0.2);
}

.theme-toggle__icon {
  font-size: 1rem;
}

/* Navigation */
.main-nav {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.main-nav a {
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.25rem 0;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.main-nav a:hover {
  color: var(--text);
}

.main-nav a.router-link-active {
  color: var(--active);
  border-bottom-color: var(--active);
}

/* App Body */
.app-body {
  padding: 2.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* App Footer */
.app-footer {
  padding: 2rem;
  text-align: center;
  color: var(--muted);
  background: var(--surface-strong);
  border-top: 1px solid var(--border);
  font-size: 0.9rem;
  transition: background-color 0.25s ease, border-color 0.25s ease;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }

  .header-actions {
    justify-content: space-between;
    gap: 1rem;
    margin-top: 0.5rem;
  }
}
</style>