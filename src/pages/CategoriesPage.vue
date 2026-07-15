<template>
  <section>
    <div class="card">
      <h1>서울 지역 정보</h1>
      <p>서울의 관광지·문화시설·축제·쇼핑·숙박·음식점 등 8개 카테고리 정보를 확인하세요.</p>
    </div>
  </section>

  <section>
    <div class="grid-3">
      <router-link
        v-for="c in categories"
        :key="c.code"
        :to="`/places/${c.code}`"
        class="card category-card"
      >
        <span class="category-emoji">{{ c.emoji }}</span>
        <h2>{{ c.label }}</h2>
        <p>{{ c.description }}</p>
        <span class="category-go">바로가기 →</span>
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { CATEGORIES } from '../constants/categories.js'

const DESCRIPTIONS = {
  '12': { emoji: '🏛️', description: '경복궁·남산 등 서울의 대표 관광지를 소개합니다.' },
  '14': { emoji: '🎨', description: '박물관·미술관·공연장 등 문화시설 정보입니다.' },
  '15': { emoji: '🎉', description: '축제·공연·행사 일정을 한눈에 확인하세요.' },
  '25': { emoji: '🗺️', description: '테마별 여행 코스를 따라 서울을 둘러보세요.' },
  '28': { emoji: '🚴', description: '한강·북한산 등 도심 속 레포츠 정보입니다.' },
  '32': { emoji: '🏨', description: '호텔·게스트하우스 등 서울 숙박 정보입니다.' },
  '38': { emoji: '🛍️', description: '전통시장부터 쇼핑 명소까지 소개합니다.' },
  '39': { emoji: '🍽️', description: '서울의 맛집과 먹거리 골목을 확인하세요.' }
}

const categories = CATEGORIES.map((c) => ({ ...c, ...DESCRIPTIONS[c.code] }))
</script>

<style scoped>
.category-card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s, transform 0.15s;
}

.category-card:hover {
  border-color: rgba(56, 189, 248, 0.5);
  transform: translateY(-2px);
}

.category-emoji {
  font-size: 1.8rem;
}

.category-card h2 {
  margin: 0.2rem 0 0;
  font-size: 1.2rem;
}

.category-card p {
  color: #cbd5e1;
  flex: 1;
}

.category-go {
  margin-top: 0.6rem;
  color: #7dd3fc;
  font-weight: 600;
  font-size: 0.95rem;
}
</style>
