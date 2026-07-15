<template>
  <section>
    <div class="card">
      <h1>서울 지역 정보</h1>
      <p>서울의 관광지·문화시설·축제·쇼핑·숙박 등 7개 카테고리 정보를 확인하세요.</p>
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
  '38': { emoji: '🛍️', description: '전통시장부터 쇼핑 명소까지 소개합니다.' }
  // 💡 음식점('39') 항목을 완전히 제외했습니다.
}

// 백엔드/상수 데이터(CATEGORIES) 목록에서 음식점을 제외하고 DESCRIPTIONS에 매칭되는 7개 카테고리만 노출합니다.
const categories = CATEGORIES
  .filter((c) => c.code !== '39')
  .map((c) => ({ ...c, ...DESCRIPTIONS[c.code] }))
</script>

<style scoped>
/* 개별 카테고리 카드 */
.category-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

/* 마우스 호버 시 초록빛 테두리와 그림자, 부드러운 리프트업 */
.category-card:hover {
  border-color: var(--accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px var(--shadow);
}

.category-emoji {
  font-size: 2rem;
  margin-bottom: 0.2rem;
}

.category-card h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
}

/* 설명문 - 테마별 텍스트 색상 연동 */
.category-card p {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
  flex: 1;
}

/* 바로가기 링크 - 포인트 초록색으로 변경 */
.category-go {
  margin-top: 0.8rem;
  color: var(--active);
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.category-card:hover .category-go {
  color: var(--accent-strong);
}
</style>