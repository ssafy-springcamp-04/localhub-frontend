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

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.2rem;
}

.filters select,
.search input {
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 999px;
  padding: 0.7rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
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

.search button,
.btn.primary {
  border: none;
  background: #38bdf8;
  color: #0f172a;
  border-radius: 999px;
  padding: 0.7rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}

.post-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
}

.post-link {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  text-decoration: none;
  color: inherit;
}

.post-link:hover {
  border-color: rgba(56, 189, 248, 0.5);
}

.badge {
  font-size: 0.78rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.15);
  color: #7dd3fc;
  white-space: nowrap;
}

.post-title {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-meta {
  display: flex;
  gap: 0.9rem;
  color: #94a3b8;
  font-size: 0.85rem;
  white-space: nowrap;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  color: #cbd5e1;
}

.pager button {
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: transparent;
  color: #e2e8f0;
  border-radius: 999px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.pager button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.state-msg {
  text-align: center;
  color: #94a3b8;
  padding: 2rem 0;
}

.state-msg.error {
  color: #fca5a5;
}

@media (max-width: 640px) {
  .list-head {
    flex-direction: column;
  }
  .post-meta {
    display: none;
  }
}
</style>
