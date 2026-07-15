<template>
  <section>
    <div class="card">
      <h1>{{ typeLabel }}</h1>
      <p>서울의 {{ typeLabel }} 정보를 카드로 확인하세요.</p>

      <nav class="type-tabs">
        <router-link
          v-for="c in categories"
          :key="c.code"
          :to="`/places/${c.code}`"
          class="type-tab"
        >
          {{ c.label }}
        </router-link>
      </nav>

      <form class="place-search" @submit.prevent="submitSearch">
        <input v-model="searchText" placeholder="장소명으로 검색" />
        <button type="submit">검색</button>
        <button v-if="activeKeyword" type="button" class="ghost" @click="clearSearch">
          초기화
        </button>
      </form>
    </div>
  </section>

  <section>
    <p v-if="isLoading" class="state-msg">불러오는 중…</p>
    <p v-else-if="errorText" class="state-msg error">{{ errorText }}</p>
    <p v-else-if="!items.length" class="state-msg">
      {{ activeKeyword ? `'${activeKeyword}' 검색 결과가 없습니다.` : '등록된 정보가 없습니다.' }}
    </p>

    <template v-else>
      <p class="result-count">
        총 <strong>{{ total }}</strong>건
        <span v-if="activeKeyword"> · '{{ activeKeyword }}' 검색</span>
      </p>

      <div class="grid-3">
        <article v-for="item in items" :key="item.id" class="place-card">
          <div class="place-thumb">
            <img
              :src="item.first_image || PLACEHOLDER"
              :alt="item.title"
              loading="lazy"
              @error="onImgError"
            />
          </div>
          <div class="place-body">
            <h2>{{ item.title }}</h2>
            <p class="addr">{{ item.addr1 || '주소 정보 없음' }}</p>
            <p v-if="item.tel" class="tel">☎ {{ item.tel }}</p>
          </div>
        </article>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getLocations } from '../api/locations.js'
import { CATEGORIES, getCategoryLabel } from '../constants/categories.js'

// 이미지 결측/로드 실패 대비 인라인 SVG 플레이스홀더 (쇼핑·음식점에 결측 다수)
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260">
      <rect width="100%" height="100%" fill="#1e293b"/>
      <text x="50%" y="50%" fill="#64748b" font-family="sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">이미지 준비 중</text>
    </svg>`
  )

const route = useRoute()
const categories = CATEGORIES
const items = ref([])
const total = ref(0)
const isLoading = ref(false)
const errorText = ref('')

const searchText = ref('') // 입력 중인 검색어
const activeKeyword = ref('') // 실제 적용된 검색어

const currentType = computed(() => route.params.type)
const typeLabel = computed(() => getCategoryLabel(currentType.value))

function onImgError(e) {
  if (e.target.src !== PLACEHOLDER) e.target.src = PLACEHOLDER
}

async function load(type, q = '') {
  isLoading.value = true
  errorText.value = ''
  activeKeyword.value = q
  try {
    const { items: rows, total: count } = await getLocations({ type, q })
    items.value = rows
    total.value = count
  } catch (err) {
    errorText.value = '목록을 불러오지 못했습니다.'
    items.value = []
    total.value = 0
  } finally {
    isLoading.value = false
  }
}

function submitSearch() {
  load(currentType.value, searchText.value.trim())
}

function clearSearch() {
  searchText.value = ''
  load(currentType.value, '')
}

// 카테고리(탭) 전환 시 검색어 초기화 후 재조회
watch(
  currentType,
  (type) => {
    searchText.value = ''
    load(type, '')
  },
  { immediate: true }
)
</script>

<style scoped>
.type-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.type-tab {
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
  text-decoration: none;
  font-size: 0.9rem;
}

.type-tab.router-link-active {
  background: #38bdf8;
  color: #0f172a;
  font-weight: 600;
}

.place-search {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.place-search input {
  flex: 1;
  min-width: 0;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 999px;
  padding: 0.7rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
}

.place-search button {
  border: none;
  background: #38bdf8;
  color: #0f172a;
  border-radius: 999px;
  padding: 0.7rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.place-search button.ghost {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.result-count {
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 0 0 1rem;
}

.result-count strong {
  color: #e2e8f0;
}

.tel {
  margin: 0.3rem 0 0;
  color: #7dd3fc;
  font-size: 0.85rem;
}

.place-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.place-thumb {
  aspect-ratio: 3 / 2;
  background: #1e293b;
}

.place-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.place-body {
  padding: 1rem;
}

.place-body h2 {
  margin: 0 0 0.4rem;
  font-size: 1.1rem;
}

.addr {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.state-msg {
  text-align: center;
  color: #94a3b8;
  padding: 2rem 0;
}

.state-msg.error {
  color: #fca5a5;
}
</style>
