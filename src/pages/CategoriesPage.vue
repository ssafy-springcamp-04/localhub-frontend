<template>
  <section>
    <div class="card">
      <h1>서울 지역 정보</h1>
      <p>서울의 관광지, 문화시설, 쇼핑, 숙박, 축제행사 데이터를 카테고리별로 확인하세요.</p>
    </div>
  </section>

  <section>
    <div class="grid-3">
      <div class="card category-card" v-for="item in categories" :key="item.id">
        <h2>{{ item.title }}</h2>
        <p>{{ item.description }}</p>
        <button class="category-button">바로가기</button>
      </div>
    </div>
  </section>
</template>

<script setup>
const categories = [
  { id: 'tourist', title: '관광지', description: '서울의 주요 관광지를 다양한 목록으로 제공합니다.' },
  { id: 'sports', title: '레포츠', description: '도심 속 레포츠 및 야외 활동 정보를 확인하세요.' },
  { id: 'culture', title: '문화시설', description: '전시, 공연, 박물관 등 문화시설 정보를 제공합니다.' },
  { id: 'shopping', title: '쇼핑', description: '서울의 쇼핑 스팟과 인기 상권을 소개합니다.' },
  { id: 'stay', title: '숙박', description: '서울 숙박 시설 정보를 확인하세요.' },
  { id: 'festival', title: '축제·공연·행사', description: '서울에서 열리는 다양한 행사 소식을 모았습니다.' }
]
</script>

<style scoped>
.category-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.category-button {
  margin-top: 1rem;
  padding: 0.85rem 1.2rem;
  border: none;
  background: #60a5fa;
  color: #ffffff;
  border-radius: 999px;
  cursor: pointer;
}
</style>
