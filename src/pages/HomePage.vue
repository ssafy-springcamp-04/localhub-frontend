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
        <router-link to="/categories">자세히 보기</router-link>
      </div>
      <div class="card home-card">
        <h2>커뮤니티</h2>
        <p>관광 계획, 리뷰, 질문을 공유하고 게시글을 관리할 수 있습니다.</p>
        <router-link to="/community">자세히 보기</router-link>
      </div>
      <div class="card home-card">
        <h2>지도</h2>
        <p>Leaflet 지도로 서울 주요 명소를 한눈에 확인하세요.</p>
        <router-link to="/map">자세히 보기</router-link>
      </div>
      <div class="card home-card">
        <h2>챗봇</h2>
        <p>서울 관광 정보와 게시글 검색을 돕는 대화형 안내를 이용해 보세요.</p>
        <router-link to="/chatbot">자세히 보기</router-link>
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
  margin-top: 1.5rem;
}

.hero-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.6rem;
  border-radius: 999px;
  background: #38bdf8;
  color: #0f172a;
  text-decoration: none;
  font-weight: 700;
}

.secondary {
  background: rgba(255,255,255,0.1);
  color: #f8fafc;
}

.home-card h2 {
  margin-top: 0;
}

.home-card p {
  color: #cbd5e1;
}

.home-card a {
  color: #7dd3fc;
  text-decoration: none;
  font-weight: 600;
}
</style>
