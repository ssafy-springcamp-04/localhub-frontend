<template>
  <section>
    <p v-if="isLoading" class="state-msg">불러오는 중…</p>
    <p v-else-if="errorText" class="state-msg error">{{ errorText }}</p>

    <div v-else-if="post" class="card">
      <div class="detail-head">
        <span class="badge">{{ categoryLabel(post.category) }}</span>
        <router-link :to="{ name: 'community-list' }" class="back-link">← 목록</router-link>
      </div>

      <h1 class="detail-title">{{ post.title }}</h1>
      <div class="detail-meta">
        <span>조회 {{ post.views }}</span>
        <span>작성 {{ formatDate(post.created_at) }}</span>
        <span v-if="post.updated_at">수정 {{ formatDate(post.updated_at) }}</span>
      </div>

      <p class="detail-content">{{ post.content }}</p>

      <div class="detail-actions">
        <button class="btn ghost" @click="openModal('edit')">수정</button>
        <button class="btn danger" @click="openModal('delete')">삭제</button>
      </div>
    </div>
  </section>

  <PasswordModal
    v-if="modal"
    :title="modal === 'delete' ? '게시글 삭제' : '수정 전 확인'"
    :description="modal === 'delete'
      ? '삭제하려면 작성 시 비밀번호를 입력하세요. 삭제 후 되돌릴 수 없습니다.'
      : '수정하려면 작성 시 비밀번호를 입력하세요.'"
    :confirm-label="modal === 'delete' ? '삭제' : '확인'"
    :on-submit="modal === 'delete' ? handleDelete : handleVerify"
    @close="modal = ''"
    @success="onModalSuccess"
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPost, verifyPassword, deletePost } from '../../api/posts.js'
import { getCategoryLabel } from '../../constants/categories.js'
import PasswordModal from '../../components/community/PasswordModal.vue'

const route = useRoute()
const router = useRouter()

const post = ref(null)
const isLoading = ref(false)
const errorText = ref('')
const modal = ref('') // '' | 'edit' | 'delete'

function categoryLabel(code) {
  return getCategoryLabel(code)
}

function formatDate(iso) {
  return iso ? iso.replace('T', ' ').slice(0, 16) : ''
}

function openModal(kind) {
  modal.value = kind
}

// 수정 진입: 비밀번호 검증 (계약서 §1-4)
function handleVerify(password) {
  return verifyPassword(route.params.id, password)
}

// 삭제: verify 없이 바로 검증+삭제 (계약서 §1-6)
function handleDelete(password) {
  return deletePost(route.params.id, password)
}

function onModalSuccess({ password }) {
  const kind = modal.value
  modal.value = ''
  if (kind === 'delete') {
    router.replace({ name: 'community-list' })
  } else {
    // 검증된 비밀번호 + 게시글 스냅샷을 수정 화면으로 전달 (재입력 방지)
    // state 값은 History API 로 직렬화되므로 원본 객체 대신 순수 값으로 복사
    router.push({
      name: 'community-edit',
      params: { id: route.params.id },
      state: { password, post: { ...post.value } }
    })
  }
}

async function load() {
  isLoading.value = true
  errorText.value = ''
  post.value = null
  try {
    post.value = await getPost(route.params.id)
  } catch (err) {
    errorText.value = err.response?.data?.detail ?? '게시글을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

watch(() => route.params.id, load, { immediate: true })
</script>

<style scoped>
.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.badge {
  font-size: 0.8rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.15);
  color: #7dd3fc;
}

.back-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
}

.detail-title {
  margin: 0 0 0.7rem;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  color: #94a3b8;
  font-size: 0.9rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.detail-content {
  white-space: pre-wrap;
  line-height: 1.7;
  margin: 1.4rem 0 2rem;
}

.detail-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
}

.btn {
  border: none;
  border-radius: 999px;
  padding: 0.7rem 1.3rem;
  cursor: pointer;
  font-weight: 600;
}

.btn.ghost {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.btn.danger {
  background: rgba(248, 113, 113, 0.9);
  color: #450a0a;
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
