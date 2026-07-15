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
          <select v-model="district" @change="reloadFromFirst">
            <option value="">전체 지역(구)</option>
            <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
          </select>

          <select v-model="sort" @change="reloadFromFirst">
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
              :title="isLiked(item.id) ? '추천 취소' : '추천'"
              @click="toggleLike(item)"
            >
              ★ {{ item.likes }}
            </button>
          </div>
        </article>
      </div>

      <!-- 페이지네이션 -->
      <nav v-if="totalPages > 1" class="pagination" aria-label="페이지 이동">
        <button class="page-btn" :disabled="page === 1" @click="changePage(page - 1)">이전</button>

        <button v-if="pageNumbers[0] > 1" class="page-btn" @click="changePage(1)">1</button>
        <span v-if="pageNumbers[0] > 2" class="page-ellipsis">…</span>

        <button
          v-for="p in pageNumbers"
          :key="p"
          class="page-btn"
          :class="{ active: p === page }"
          @click="changePage(p)"
        >
          {{ p }}
        </button>

        <span v-if="pageNumbers[pageNumbers.length - 1] < totalPages - 1" class="page-ellipsis">…</span>
        <button
          v-if="pageNumbers[pageNumbers.length - 1] < totalPages"
          class="page-btn"
          @click="changePage(totalPages)"
        >
          {{ totalPages }}
        </button>

        <button class="page-btn" :disabled="page === totalPages" @click="changePage(page + 1)">다음</button>
      </nav>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getLocations, getDistricts, likeLocation, unlikeLocation } from '../api/locations.js'
import { CATEGORIES, getCategoryLabel } from '../constants/categories.js'

// 이미지 로드 실패 대비 인라인 SVG 플레이스홀더
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260">
      <rect width="100%" height="100%" fill="#142219"/>
      <text x="50%" y="50%" fill="#708573" font-family="sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">이미지 준비 중</text>
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

const PAGE_SIZE = 12
const page = ref(1) // 현재 페이지 (1부터)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

// 현재 페이지 주변으로 보여줄 페이지 번호 창(최대 5개)
const pageNumbers = computed(() => {
  const tp = totalPages.value
  const win = 5
  let start = Math.max(1, page.value - Math.floor(win / 2))
  const end = Math.min(tp, start + win - 1)
  start = Math.max(1, end - win + 1)
  const arr = []
  for (let p = start; p <= end; p++) arr.push(p)
  return arr
})

// 좋아요 중복 방지
const likedIds = ref(new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || '[]')))

const currentType = computed(() => route.params.type)
const typeLabel = computed(() => getCategoryLabel(currentType.value))

function onImgError(e) {
  if (e.target.src !== PLACEHOLDER) e.target.src = PLACEHOLDER
}

function isLiked(id) {
  return likedIds.value.has(id)
}

function persistLikedIds() {
  localStorage.setItem(LIKED_KEY, JSON.stringify([...likedIds.value]))
}

// 추천 / 추천 취소 토글
async function toggleLike(item) {
  if (isLiked(item.id)) {
    try {
      const { likes } = await unlikeLocation(item.id)
      item.likes = likes
      likedIds.value.delete(item.id)
      persistLikedIds()
    } catch (err) {
      // 추천 취소 실패 무시
    }
    return
  }
  try {
    const { likes } = await likeLocation(item.id)
    item.likes = likes
    likedIds.value.add(item.id)
    persistLikedIds()
  } catch (err) {
    // 추천 실패 무시
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
      sort: sort.value,
      page: page.value,
      size: PAGE_SIZE
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

// 필터/검색/정렬 변경 → 1페이지부터 다시 조회
function reloadFromFirst() {
  page.value = 1
  reload()
}

// 페이지 이동 → 조회 후 상단으로 스크롤
function changePage(p) {
  if (p < 1 || p > totalPages.value || p === page.value) return
  page.value = p
  reload()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function submitSearch() {
  reloadFromFirst()
}

function clearSearch() {
  searchText.value = ''
  reloadFromFirst()
}

// 카테고리(탭) 전환 시 필터/검색/정렬 초기화 후 구 목록 + 목록 재조회
watch(
  currentType,
  async (type) => {
    searchText.value = ''
    activeKeyword.value = ''
    district.value = ''
    sort.value = 'name'
    page.value = 1
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
/* 상단 카테고리 탭 영역 */
.type-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.25rem;
}

.type-tab {
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.type-tab:hover {
  color: var(--text);
  border-color: var(--text-muted);
}

/* 활성화 상태의 탭 - 포인트 초록색 지정 */
.type-tab.router-link-active {
  background: var(--accent);
  color: #ffffff;
  border-color: var(--accent);
  font-weight: 600;
}

/* 정렬 및 검색 영역 */
.place-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
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
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.7rem 1.1rem;
  background: var(--bg);
  color: var(--text);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease, background-color 0.25s ease;
}

.place-search input:focus {
  border-color: var(--accent);
}

.place-search input::placeholder {
  color: var(--muted);
}

.place-search button {
  border: none;
  background: var(--accent);
  color: #ffffff;
  border-radius: 999px;
  padding: 0.7rem 1.3rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;
}

.place-search button:hover {
  background: var(--accent-strong);
}

/* 검색어 초기화용 서브 버튼 */
.place-search button.ghost {
  background: var(--surface-strong);
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.place-search button.ghost:hover {
  color: var(--text);
  background: var(--border);
}

.place-filters {
  display: flex;
  gap: 0.5rem;
}

.place-filters select {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.7rem 1.1rem;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease, background-color 0.25s ease;
}

.place-filters select:focus {
  border-color: var(--accent);
}

.place-filters select option {
  background: var(--surface-strong);
  color: var(--text);
}

/* 데이터 결과 카운트 */
.result-count {
  color: var(--text-muted);
  font-size: 0.88rem;
  margin: 0 0 1.25rem;
  font-weight: 500;
}

.result-count strong {
  color: var(--accent);
}

/* 장소 카드 디자인 */
.place-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px var(--shadow);
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.place-card:hover {
  border-color: var(--accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px var(--shadow);
}

.place-thumb {
  height: 200px;
  background: var(--surface-strong);
  border-bottom: 1px solid var(--border);
  /* 사진을 박스 안에서 가로·세로 가운데 정렬 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.place-thumb img {
  /* 비율 유지하며 박스에 맞춰 축소 (포스터가 잘리지 않고 전체가 보임) */
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.place-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  /* 글씨는 카드 하단에 정렬 (썸네일 높이는 이미 통일됨) */
  justify-content: flex-end;
}

.place-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.place-body h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 구 정보 배지 - 연한 브랜드 초록색 */
.badge-district {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--active);
}

.addr {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.45;
}

/* 전화번호 텍스트 (포인트 초록색) */
.tel {
  margin: 0;
  color: var(--active);
  font-size: 0.85rem;
  font-weight: 600;
}

/* 좋아요 버튼 */
.like-btn {
  align-self: flex-start;
  margin-top: 0.5rem;
  border: 1px solid rgba(250, 204, 21, 0.4);
  background: transparent;
  color: #facc15;
  border-radius: 999px;
  padding: 0.4rem 0.95rem;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s ease;
}

.like-btn:hover:not(:disabled) {
  background: rgba(250, 204, 21, 0.1);
  border-color: #facc15;
}

.like-btn.liked {
  background: #facc15;
  color: #422006;
  border-color: transparent;
  cursor: default;
}

.state-msg {
  text-align: center;
  color: var(--text-muted);
  padding: 3rem 0;
  font-weight: 500;
}

.state-msg.error {
  color: #ef4444;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 2rem;
}

.page-btn {
  min-width: 2.4rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.page-btn:hover:not(:disabled):not(.active) {
  background: var(--surface-strong);
  color: var(--text);
  border-color: var(--text-muted);
}

.page-btn.active {
  background: var(--accent);
  color: #ffffff;
  border-color: var(--accent);
  cursor: default;
}

.page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.page-ellipsis {
  padding: 0 0.25rem;
  color: var(--text-muted);
}
</style>