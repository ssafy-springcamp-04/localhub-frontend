<template>
  <section>
    <div class="card">
      <h1>커뮤니티</h1>
      <p>게시글 목록을 확인하고 새 글을 작성하거나 수정/삭제할 수 있습니다.</p>
    </div>
  </section>

  <section class="card">
    <div class="community-header">
      <div>
        <h2>게시글 목록</h2>
        <p>제목 검색으로 원하는 글을 빠르게 찾을 수 있습니다.</p>
      </div>
      <input v-model="query" placeholder="제목으로 검색" />
    </div>

    <div class="post-list">
      <article v-for="post in filteredPosts" :key="post.id" class="post-item">
        <h3>{{ post.title }}</h3>
        <p>{{ post.summary }}</p>
        <div class="post-meta">
          <span>조회 {{ post.views }}</span>
          <span>{{ post.createdAt }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const query = ref('')
const posts = ref([
  { id: 1, title: '한강 자전거 코스 추천', summary: '한강에서 즐길 수 있는 자전거 코스를 소개합니다.', views: 132, createdAt: '2026-07-14' },
  { id: 2, title: '홍대 맛집과 축제 정보', summary: '홍대 인근 즐길거리와 축제 정보를 모았습니다.', views: 89, createdAt: '2026-07-13' },
  { id: 3, title: '서울 야경 명소 TOP5', summary: '밤에 가볼 만한 서울 야경 명소를 정리했습니다.', views: 210, createdAt: '2026-07-12' }
])

const filteredPosts = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return posts.value
  return posts.value.filter(post => post.title.toLowerCase().includes(term))
})
</script>

<style scoped>
.community-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.community-header input {
  width: 240px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  border-radius: 999px;
  padding: 0.9rem 1rem;
  background: rgba(255,255,255,0.05);
  color: #f8fafc;
}

.post-list {
  display: grid;
  gap: 1rem;
}

.post-item {
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.2rem;
  background: rgba(255,255,255,0.03);
}

.post-item h3 {
  margin: 0 0 0.7rem;
}

.post-meta {
  display: flex;
  gap: 1rem;
  color: #94a3b8;
  font-size: 0.95rem;
}
</style>
