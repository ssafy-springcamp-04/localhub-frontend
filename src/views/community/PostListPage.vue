<template>
  <section>
    <div class="card">
      <div class="list-head">
        <div>
          <h1>커뮤니티</h1>
          <p>가입 없이 질문과 후기를 남겨보세요. 수정·삭제는 작성 시 비밀번호로 가능합니다.</p>
        </div>
        <router-link class="btn primary" :to="{ name: 'community-new' }">글쓰기</router-link>
      </div>

      <div class="filters">
        <select v-model="category" @change="applyFilters">
          <option value="">전체 카테고리</option>
          <option v-for="c in categories" :key="c.code" :value="c.code">{{ c.label }}</option>
        </select>

        <form class="search" @submit.prevent="applyFilters">
          <input v-model="keyword" placeholder="제목으로 검색" />
          <button type="submit">검색</button>
        </form>
      </div>
    </div>
  </section>

  <section class="card">
    <p v-if="isLoading" class="state-msg">불러오는 중…</p>
    <p v-else-if="errorText" class="state-msg error">{{ errorText }}</p>
    <p v-else-if="!items.length" class="state-msg">게시글이 없습니다.</p>

    <ul v-else class="post-list">
      <li v-for="post in items" :key="post.id" class="post-item">
        <router-link :to="{ name: 'community-detail', params: { id: post.id } }" class="post-link">
          <span class="badge">{{ categoryLabel(post.category) }}</span>
          <span class="post-title">{{ post.title }}</span>
          <span class="post-meta">
            <span>조회 {{ post.views }}</span>
            <span>{{ formatDate(post.created_at) }}</span>
          </span>
        </router-link>
      </li>
    </ul>

    <nav v-if="totalPages > 1" class="pager">
      <button :disabled="page <= 1" @click="goPage(page - 1)">이전</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="goPage(page + 1)">다음</button>
    </nav>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listPosts } from '../../api/posts.js'
import { CATEGORIES, getCategoryLabel } from '../../constants/categories.js'

const route = useRoute()
const router = useRouter()

const categories = CATEGORIES
const SIZE = 10

const items = ref([])
const total = ref(0)
const isLoading = ref(false)
const errorText = ref('')

// URL 쿼리를 단일 소스로 사용 (뒤로가기/공유 대응)
const category = ref(route.query.category || '')
const keyword = ref(route.query.q || '')
const page = computed(() => Number(route.query.page) || 1)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / SIZE)))

function categoryLabel(code) {
  return getCategoryLabel(code)
}

function formatDate(iso) {
  return iso ? iso.slice(0, 10) : ''
}

function applyFilters() {
  router.push({
    name: 'community-list',
    query: {
      category: category.value || undefined,
      q: keyword.value.trim() || undefined,
      page: 1
    }
  })
}

function goPage(next) {
  router.push({ name: 'community-list', query: { ...route.query, page: next } })
}

async function load() {
  isLoading.value = true
  errorText.value = ''
  try {
    const res = await listPosts({
      category: route.query.category || '',
      q: route.query.q || '',
      page: page.value,
      size: SIZE
    })
    items.value = res.items
    total.value = res.total
  } catch (err) {
    errorText.value = '목록을 불러오지 못했습니다.'
    items.value = []
    total.value = 0
  } finally {
    isLoading.value = false
  }
}

// 쿼리 변경 시 재조회 + 필터 입력값 동기화
watch(
  () => route.query,
  () => {
    category.value = route.query.category || ''
    keyword.value = route.query.q || ''
    load()
  },
  { immediate: true }
)
</script>

<style scoped>
.list-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.list-head h1 {
  margin: 0 0 0.4rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text);
}

.list-head p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

/* 드롭다운 및 입력 필드 공통화 */
.filters select,
.search input {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.7rem 1.1rem;
  background: var(--bg);
  color: var(--text);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease, background-color 0.25s ease;
}

.filters select:focus,
.search input:focus {
  border-color: var(--accent);
}

.filters select option {
  background: var(--surface-strong);
  color: var(--text);
}

.search {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  min-width: 220px;
}

.search input {
  flex: 1;
}

.search input::placeholder {
  color: var(--muted);
}

/* 버튼 스타일 (브랜드 초록색 포인트 매칭) */
.search button,
.btn.primary {
  border: none;
  background: var(--accent);
  color: #ffffff; /* 가독성을 위한 흰색 텍스트 고정 */
  border-radius: 999px;
  padding: 0.7rem 1.3rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.search button:hover,
.btn.primary:hover {
  background: var(--accent-strong);
}

.post-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

/* 개별 리스트 아이템 */
.post-link {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface-strong);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
}

.post-link:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

/* 카테고리 배지 - 연한 초록 기반 */
.badge {
  font-size: 0.78rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--active);
  font-weight: 600;
  white-space: nowrap;
}

.post-title {
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-meta {
  display: flex;
  gap: 1rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  white-space: nowrap;
}

/* 페이저 컴포넌트 */
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 1.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

.pager button {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: 999px;
  padding: 0.5rem 1.1rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pager button:hover:not(:disabled) {
  border-color: var(--text-muted);
  background: var(--surface-strong);
}

.pager button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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

@media (max-width: 640px) {
  .list-head {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .btn.primary {
    align-self: flex-start;
  }

  .post-meta {
    display: none;
  }
  
  .post-link {
    grid-template-columns: auto 1fr;
  }
}
</style>