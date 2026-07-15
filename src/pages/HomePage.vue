<template>
  <section>
    <div class="hero">
      <!-- 1) 제목: 위쪽 가운데 -->
      <div class="hero-text">
        <h1>서울 익스플로러</h1>
        <p>서울의 관광지, 레포츠, 문화시설, 쇼핑, 숙박, 축제공연행사 정보를 한 곳에서 확인하고, 커뮤니티와 챗봇으로 더 쉽게 계획하세요.</p>
      </div>

      <!-- 2) 소개 카드: 가운데 (카드별 색상) -->
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

      <!-- 3) 사진: 아래 (박스 폭에 꽉 차게, 잘리지 않음) -->
      <img class="hero-img" src="/hero-bg.png" alt="서울 전경 일러스트" />
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.hero {
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--card-bg);
  box-shadow: 0 10px 30px var(--shadow);
  overflow: hidden;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 제목/설명: 가운데 정렬 */
.hero-text {
  max-width: 760px;
  margin: 0 auto;
  text-align: center;
}

.hero-text h1 {
  margin: 0 0 0.75rem;
  font-size: 2.6rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text);
}

.hero-text p {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.65;
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

/* 사진: 박스 폭에 꽉 차게(패딩 상쇄) 하단에 배치, 잘림 없음 */
.hero-img {
  display: block;
  width: calc(100% + 5rem);
  height: auto;
  margin: 0 -2.5rem -2.5rem;
}

/* 좁은 화면: 카드 세로 정렬 + 여백 축소 */
@media (max-width: 820px) {
  .hero {
    padding: 1.75rem;
  }

  .hero-text h1 {
    font-size: 1.9rem;
  }

  .hero-cards {
    grid-template-columns: 1fr;
  }

  .hero-img {
    width: calc(100% + 3.5rem);
    margin: 0 -1.75rem -1.75rem;
  }
}
</style>
