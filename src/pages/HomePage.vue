<template>
  <section>
    <div class="hero">
      <!-- 배경 대신 실제 이미지로 넣어 잘리지 않고 전체가 보이도록 -->
      <img class="hero-img" src="/hero-bg.png" alt="서울 전경 일러스트" />

      <div class="hero-content">
        <div class="hero-text">
          <h1>서울 익스플로러</h1>
          <p>서울의 관광지, 레포츠, 문화시설, 쇼핑, 숙박, 축제공연행사 정보를 한 곳에서 확인하고, 커뮤니티와 챗봇으로 더 쉽게 계획하세요.</p>
        </div>

        <!-- 삭제한 CTA 버튼 자리에 소개 카드를 옮겨 배치 (카드별 색상 적용) -->
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
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.hero {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background-color: var(--surface-strong);
  box-shadow: 0 10px 30px var(--shadow);
}

/* 이미지 전체가 잘리지 않고 보이도록 (width 100%, 높이는 비율대로) */
.hero-img {
  display: block;
  width: 100%;
  height: auto;
}

/* 이미지 위에 텍스트(상단)와 카드(하단)를 겹쳐 배치 */
.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 3rem;
}

/* 텍스트는 반투명 패널 위에 올려 배경 위에서도 또렷하게 */
.hero-text {
  max-width: 620px;
  padding: 1.4rem 1.6rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.66);
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.hero-text h1 {
  margin: 0 0 0.75rem;
  font-size: 2.6rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f2417;
}

.hero-text p {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.65;
  color: #1e3a29;
}

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

/* 좁은 화면: 겹침을 풀고 이미지 → 텍스트 → 카드 순서로 세로 배치 */
@media (max-width: 820px) {
  .hero-content {
    position: static;
    padding: 1.5rem;
  }

  .hero-text {
    max-width: none;
  }

  .hero-text h1 {
    font-size: 1.9rem;
  }

  .hero-cards {
    grid-template-columns: 1fr;
  }
}
</style>
