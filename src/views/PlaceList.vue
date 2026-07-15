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

      <div class="place-controls">
        <form class="place-search" @submit.prevent="submitSearch">
          <input v-model="searchText" placeholder="장소명으로 검색" />
          <button type="submit">검색</button>
          <button v-if="activeKeyword" type="button" class="ghost" @click="clearSearch">
            초기화
          </button>
        </form>

        <div class="place-filters">
          <select v-model="district" @change="reload">
            <option value="">전체 지역(구)</option>
            <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
          </select>

          <select v-model="sort" @change="reload">
            <option value="name">이름순</option>
            <option value="likes">추천순</option>
          </select>
        </div>
      </div>
    </div>
  </section>

  <section>
    <p v-if="isLoading" class="state-msg">불러오는 중…</p>
    <p v-else-if="errorText" class="state-msg error">{{ errorText }}</p>
    <p v-else-if="!items.length" class="state-msg">
      {{ activeKeyword ? `'${activeKeyword}' 검색 결과가 없습니다.` : '조건에 맞는 정보가 없습니다.' }}
    </p>

    <template v-else>
      <p class="result-count">
        총 <strong>{{ total }}</strong>건
        <span v-if="district"> · {{ district }}</span>
        <span v-if="activeKeyword"> · '{{ activeKeyword }}' 검색</span>
        <span> · {{ sort === 'likes' ? '추천순' : '이름순' }}</span>
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
            <div class="place-title-row">
              <h2>{{ item.title }}</h2>
              <span class="badge-district">{{ item.district || '기타' }}</span>
            </div>
            <p class="addr">{{ item.addr1 || '주소 정보 없음' }}</p>
            <p v-if="item.tel" class="tel">☎ {{ item.tel }}</p>

            <button
              class="like-btn"
              :class="{ liked: isLiked(item.id) }"
              :disabled="isLiked(item.id)"
              @click="like(item)"
            >
              ★ {{ item.likes }}
            </button>
          </div>
        </article>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getLocations, getDistricts, likeLocation } from '../api/locations.js'
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

const LIKED_KEY = 'liked_locations'

const route = useRoute()
const categories = CATEGORIES
const items = ref([])
const total = ref(0)
const districts = ref([])
const isLoading = ref(false)
const errorText = ref('')

const searchText = ref('') // 입력 중인 검색어
const activeKeyword = ref('') // 실제 적용된 검색어
const district = ref('') // 구별 필터
const sort = ref('name') // 정렬 (name | likes)

// 좋아요 중복 방지(best-effort) — localStorage 에 누른 id 저장 (계약서 §2-4)
const likedIds = ref(new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || '[]')))

const currentType = computed(() => route.params.type)
const typeLabel = computed(() => getCategoryLabel(currentType.value))

function onImgError(e) {
  if (e.target.src !== PLACEHOLDER) e.target.src = PLACEHOLDER
}

function isLiked(id) {
  return likedIds.value.has(id)
}

async function like(item) {
  if (isLiked(item.id)) return
  try {
    const { likes } = await likeLocation(item.id)
    item.likes = likes
    likedIds.value.add(item.id)
    localStorage.setItem(LIKED_KEY, JSON.stringify([...likedIds.value]))
  } catch (err) {
    // 좋아요 실패는 조용히 무시 (익명 카운트, 재시도 가능)
  }
}

async function reload() {
  const type = currentType.value
  isLoading.value = true
  errorText.value = ''
  activeKeyword.value = searchText.value.trim()
  try {
    const { items: rows, total: count } = await getLocations({
      type,
      q: activeKeyword.value,
      district: district.value,
      sort: sort.value
    })
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
  reload()
}

function clearSearch() {
  searchText.value = ''
  reload()
}

// 카테고리(탭) 전환 시 필터/검색/정렬 초기화 후 구 목록 + 목록 재조회
watch(
  currentType,
  async (type) => {
    searchText.value = ''
    activeKeyword.value = ''
    district.value = ''
    sort.value = 'name'
    try {
      districts.value = (await getDistricts(type)).items
    } catch (err) {
      districts.value = []
    }
    reload()
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

.place-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.place-search {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  min-width: 240px;
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

.place-filters {
  display: flex;
  gap: 0.5rem;
}

.place-filters select {
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 999px;
  padding: 0.7rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
  cursor: pointer;
}

.result-count {
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 0 0 1rem;
}

.result-count strong {
  color: #e2e8f0;
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
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.place-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.place-body h2 {
  margin: 0;
  font-size: 1.1rem;
}

.badge-district {
  flex-shrink: 0;
  font-size: 0.75rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  color: #cbd5e1;
}

.addr {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.tel {
  margin: 0;
  color: #7dd3fc;
  font-size: 0.85rem;
}

.like-btn {
  align-self: flex-start;
  margin-top: 0.5rem;
  border: 1px solid rgba(250, 204, 21, 0.5);
  background: transparent;
  color: #facc15;
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  font-weight: 600;
}

.like-btn.liked {
  background: #facc15;
  color: #422006;
  border-color: transparent;
  cursor: default;
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
