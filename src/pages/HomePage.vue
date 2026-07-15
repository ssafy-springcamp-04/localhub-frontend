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

    <!-- 사진 박스 (박스에 꽉 차게, 잘림 없음) -->
    <div class="card photo-box">
      <img class="hero-img" src="/hero-bg.png" alt="서울 전경 일러스트" />
    </div>
  </div>
</template>

<script setup>
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
  color: #ffffff;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.26);
  filter: brightness(1.06);
}

.feature-card h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
}

.feature-card p {
  margin: 0;
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.92);
}

.feature-more {
  margin-top: 0.6rem;
  font-weight: 700;
  font-size: 0.9rem;
  color: #ffffff;
}

/* 카드별 색상 (초록 계열에서 살짝씩 변주) */
.feature-card.region {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.feature-card.community {
  background: linear-gradient(135deg, #10b981, #0d9488);
}

.feature-card.map {
  background: linear-gradient(135deg, #14b8a6, #0ea5e9);
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
