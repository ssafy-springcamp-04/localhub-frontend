<template>
  <section>
    <div class="card">
      <h1>서울 익스플로러</h1>
      <p>서울의 관광지, 레포츠, 문화시설, 쇼핑, 숙박, 축제공연행사 정보를 한 곳에서 확인하고, 커뮤니티와 챗봇으로 더 쉽게 계획하세요.</p>
      <div class="home-actions">
        <router-link class="hero-button" to="/categories">지역 정보 보기</router-link>
        <router-link class="hero-button secondary" to="/community">커뮤니티 글쓰기</router-link>
      </div>
    </div>
  </section>

  <section>
    <div class="grid-3">
      <div class="card home-card">
        <h2>지역 정보</h2>
        <p>서울의 다양한 지역 데이터를 카테고리별로 살펴보세요.</p>
        <router-link to="/categories">자세히 보기 →</router-link>
      </div>
      <div class="card home-card">
        <h2>커뮤니티</h2>
        <p>관광 계획, 리뷰, 질문을 공유하고 게시글을 관리할 수 있습니다.</p>
        <router-link to="/community">자세히 보기 →</router-link>
      </div>
      <div class="card home-card">
        <h2>지도</h2>
        <p>Leaflet 지도로 서울 주요 명소를 한눈에 확인하세요.</p>
        <router-link to="/map">자세히 보기 →</router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.home-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.75rem;
}

/* 메인 히어로 버튼 (브랜드 초록 테마 적용) */
.hero-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.75rem;
  border-radius: 999px;
  background: var(--accent);
  color: #ffffff; /* 가독성을 위해 흰색 글자 고정 */
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.hero-button:hover {
  background: var(--accent-strong);
  transform: translateY(-1px);
}

/* 보조 버튼 (테마의 표면 컬러와 보더 조화) */
.hero-button.secondary {
  background: var(--surface-strong);
  color: var(--text);
  border: 1px solid var(--border);
}

.hero-button.secondary:hover {
  background: var(--border);
}

/* 개별 소개 카드 스타일 */
.home-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.home-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
}

.home-card h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text);
}

.home-card p {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
  flex: 1;
}

/* 자세히 보기 링크 (포인트 초록 테마 적용) */
.home-card a {
  align-self: flex-start;
  margin-top: 0.75rem;
  color: var(--active);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.home-card a:hover {
  color: var(--accent-strong);
}
</style>