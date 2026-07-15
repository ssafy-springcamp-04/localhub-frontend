<template>
  <div class="home">
    <!-- 제목 박스 (왼쪽 정렬) -->
    <div class="card title-box">
      <h1>Seoul Explorer</h1>
      <p>서울의 관광·문화·쇼핑·숙박·축제 정보를 한 곳에서 확인하세요.</p>
    </div>

    <!-- 카드 박스 (카드별 색상) -->
    <div class="hero-cards">
      <router-link class="feature-card region" to="/categories">
        <h2>지역 정보</h2>
        <p>서울의 다양한 지역 데이터를 카테고리별로 살펴보세요.</p>
        <span class="feature-more">자세히 보기 →</span>
      </router-link>

      <router-link class="feature-card community" to="/community">
        <h2>커뮤니티</h2>
        <p>관광 계획, 리뷰, 질문을 공유하고 게시글을 관리할 수 있습니다.</p>
        <span class="feature-more">자세히 보기 →</span>
      </router-link>

      <router-link class="feature-card map" to="/map">
        <h2>지도</h2>
        <p>Leaflet 지도로 서울 주요 명소를 한눈에 확인하세요.</p>
        <span class="feature-more">자세히 보기 →</span>
      </router-link>
    </div>

    <!-- 사진 박스 (테마에 따라 라이트/다크 이미지 교체, 잘림 없음) -->
    <div class="card photo-box">
      <img class="hero-img" :src="heroSrc" alt="서울 전경 일러스트" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { isDarkTheme } from '../theme.js'

// 테마에 따라 히어로 이미지 1장만 로드 (다크/라이트)
const heroSrc = computed(() => (isDarkTheme.value ? '/hero-bg-dark.png' : '/hero-bg.png'))
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 제목 박스: 왼쪽 정렬 */
.title-box {
  text-align: left;
}

.title-box h1 {
  margin: 0 0 0.5rem;
  font-size: 2.4rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text);
}

.title-box p {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--text-muted);
}

/* 소개 카드 3열 */
.hero-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.feature-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  border-radius: 14px;
  text-decoration: none;
  background: var(--card-bg);
  border: 1px solid var(--border);
  /* 구분용 옅은 색 포인트 (상단 얇은 라인) */
  border-top: 3px solid var(--accent-soft);
  box-shadow: 0 6px 18px var(--shadow);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
  box-shadow: 0 12px 26px var(--shadow);
}

.feature-card h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
}

.feature-card p {
  margin: 0;
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-muted);
}

.feature-more {
  margin-top: 0.6rem;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--active);
}

/* 카드별 상단 포인트 색 (옅게) */
.feature-card.region {
  border-top-color: #86efac;
}

.feature-card.community {
  border-top-color: #5eead4;
}

.feature-card.map {
  border-top-color: #7dd3fc;
}

/* 사진 박스: 이미지가 박스에 꽉 차도록 패딩 제거 */
.photo-box {
  padding: 0;
  overflow: hidden;
}

.hero-img {
  display: block;
  width: 100%;
  height: auto;
}

/* 좁은 화면: 카드 세로 정렬 */
@media (max-width: 820px) {
  .title-box h1 {
    font-size: 1.9rem;
  }

  .hero-cards {
    grid-template-columns: 1fr;
  }
}
</style>
