<template>
  <div id="app">
    <header class="app-header">
      <div class="brand">
        <router-link to="/">Seoul Explorer</router-link>
      </div>
      <nav class="main-nav">
        <router-link to="/categories">지역정보</router-link>
        <router-link to="/community">커뮤니티</router-link>
        <router-link to="/map">지도</router-link>
      </nav>
    </header>

    <main class="app-body">
      <router-view />
    </main>

    <footer class="app-footer">
      <p>서울 관광 정보, 커뮤니티, 지도, 챗봇을 한 곳에서</p>
    </footer>

    <!-- 전 화면 공통 플로팅 챗봇 레이어 (라우트 없음) -->
    <ChatWidget />
  </div>

</template>

<script setup>
import ChatWidget from './components/chat/ChatWidget.vue'
</script>

<style>
:root {
  color-scheme: dark;
  font-family: 'Noto Sans KR', sans-serif;
}

html, body, #app {
  min-height: 100vh;
  margin: 0;
}

body {
  background: #0b1220;
  color: #f4f7fb;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 2rem;
  background: rgba(7, 15, 34, 0.95);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.brand a {
  color: #fff;
  font-size: 1.4rem;
  font-weight: 700;
  text-decoration: none;
}

.main-nav {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.main-nav a {
  color: #cbd5e1;
  text-decoration: none;
  font-weight: 500;
}

.main-nav a.router-link-active {
  color: #7dd3fc;
}

.app-body {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.app-footer {
  padding: 1.5rem 2rem;
  text-align: center;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
