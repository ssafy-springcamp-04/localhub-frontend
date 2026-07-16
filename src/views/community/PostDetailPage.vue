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

  <!-- 댓글 -->
  <section v-if="post" class="card comment-card">
    <h2 class="comment-title">댓글 <span class="comment-count">{{ comments.length }}</span></h2>

    <form class="comment-form" @submit.prevent="submitComment">
      <textarea
        v-model="newComment.content"
        placeholder="댓글을 입력하세요 (최대 500자)"
        maxlength="500"
        rows="2"
        :disabled="posting"
      ></textarea>
      <div class="comment-form-row">
        <input
          v-model="newComment.password"
          type="password"
          placeholder="비밀번호 (4~20자)"
          :disabled="posting"
        />
        <button type="submit" class="btn primary" :disabled="posting || !canSubmit">등록</button>
      </div>
      <p v-if="commentError" class="comment-error">{{ commentError }}</p>
    </form>

    <p v-if="!comments.length" class="comment-empty">첫 댓글을 남겨보세요.</p>
    <ul v-else class="comment-list">
      <li v-for="c in comments" :key="c.id" class="comment-item">
        <template v-if="editing && editing.id === c.id">
          <textarea
            v-model="editing.content"
            class="comment-edit-area"
            maxlength="500"
            rows="2"
          ></textarea>
          <div class="comment-item-actions">
            <button class="link-btn" :disabled="savingEdit || !editing.content.trim()" @click="saveEdit">저장</button>
            <button class="link-btn" @click="editing = null">취소</button>
          </div>
        </template>
        <template v-else>
          <p class="comment-content">{{ c.content }}</p>
          <div class="comment-item-foot">
            <span class="comment-date">
              {{ formatDate(c.updated_at || c.created_at) }}<span v-if="c.updated_at"> (수정됨)</span>
            </span>
            <div class="comment-item-actions">
              <button class="link-btn" @click="openCommentModal('edit', c.id)">수정</button>
              <button class="link-btn danger" @click="openCommentModal('delete', c.id)">삭제</button>
            </div>
          </div>
        </template>
      </li>
    </ul>
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

  <PasswordModal
    v-if="commentModal"
    :title="commentModal.mode === 'delete' ? '댓글 삭제' : '댓글 수정 확인'"
    :description="commentModal.mode === 'delete'
      ? '삭제하려면 작성 시 비밀번호를 입력하세요. 삭제 후 되돌릴 수 없습니다.'
      : '수정하려면 작성 시 비밀번호를 입력하세요.'"
    :confirm-label="commentModal.mode === 'delete' ? '삭제' : '확인'"
    :on-submit="commentModalSubmit"
    @close="commentModal = null"
    @success="onCommentModalSuccess"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPost, verifyPassword, deletePost } from '../../api/posts.js'
import {
  getComments,
  createComment,
  verifyCommentPassword,
  updateComment,
  deleteComment
} from '../../api/comments.js'
import { getCategoryLabel } from '../../constants/categories.js'
import PasswordModal from '../../components/community/PasswordModal.vue'

const route = useRoute()
const router = useRouter()

const post = ref(null)
const isLoading = ref(false)
const errorText = ref('')
const modal = ref('') // '' | 'edit' | 'delete'

// ---- 댓글 상태 ----
const comments = ref([])
const newComment = ref({ content: '', password: '' })
const posting = ref(false)
const commentError = ref('')
const commentModal = ref(null) // { mode: 'edit'|'delete', id } | null
const editing = ref(null) // { id, password, content } | null
const savingEdit = ref(false)

const canSubmit = computed(
  () =>
    newComment.value.content.trim().length > 0 &&
    newComment.value.password.trim().length >= 4
)

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

// ---- 댓글 로직 ----
async function loadComments() {
  try {
    const { items } = await getComments(route.params.id)
    comments.value = items
  } catch (err) {
    comments.value = []
  }
}

async function submitComment() {
  if (posting.value || !canSubmit.value) return
  posting.value = true
  commentError.value = ''
  try {
    await createComment(route.params.id, {
      content: newComment.value.content.trim(),
      password: newComment.value.password
    })
    newComment.value = { content: '', password: '' }
    await loadComments()
  } catch (err) {
    commentError.value = err.response?.data?.detail ?? '댓글 등록에 실패했습니다.'
  } finally {
    posting.value = false
  }
}

function openCommentModal(mode, id) {
  editing.value = null
  commentError.value = ''
  commentModal.value = { mode, id }
}

// 삭제면 바로 삭제, 수정이면 비밀번호 검증 (PasswordModal 이 호출)
function commentModalSubmit(password) {
  const { mode, id } = commentModal.value
  if (mode === 'delete') return deleteComment(id, password)
  return verifyCommentPassword(id, password)
}

function onCommentModalSuccess({ password }) {
  const { mode, id } = commentModal.value
  commentModal.value = null
  if (mode === 'delete') {
    loadComments()
  } else {
    const target = comments.value.find((c) => c.id === id)
    editing.value = { id, password, content: target ? target.content : '' }
  }
}

async function saveEdit() {
  if (savingEdit.value || !editing.value.content.trim()) return
  savingEdit.value = true
  commentError.value = ''
  try {
    await updateComment(editing.value.id, {
      password: editing.value.password,
      content: editing.value.content.trim()
    })
    editing.value = null
    await loadComments()
  } catch (err) {
    commentError.value = err.response?.data?.detail ?? '댓글 수정에 실패했습니다.'
  } finally {
    savingEdit.value = false
  }
}

async function load() {
  isLoading.value = true
  errorText.value = ''
  post.value = null
  comments.value = []
  editing.value = null
  commentModal.value = null
  try {
    post.value = await getPost(route.params.id)
    await loadComments()
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

/* 카테고리 배지 - 초록 테마 연동 */
.badge {
  font-size: 0.8rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--active);
  font-weight: 600;
}

.back-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: var(--text);
}

.detail-title {
  margin: 0 0 0.7rem;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  color: var(--text-muted);
  font-size: 0.88rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid var(--border);
  transition: border-color 0.25s ease;
}

.detail-content {
  white-space: pre-wrap;
  line-height: 1.75;
  margin: 1.5rem 0 2.5rem;
  font-size: 1.05rem;
  color: var(--text);
}

.detail-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
}

.btn {
  border: none;
  border-radius: 999px;
  padding: 0.7rem 1.4rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

/* 수정(기본) 버튼 */
.btn.ghost {
  background: var(--surface-strong);
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.btn.ghost:hover {
  color: var(--text);
  background: var(--border);
}

/* 삭제(Danger) 버튼 */
.btn.danger {
  background: #ef4444;
  color: #ffffff; /* 라이트 모드 가독성을 위해 흰색 글자 고정 */
}

.btn.danger:hover {
  background: #dc2626;
}

/* 페이지 로딩 및 에러 상태 영역 */
.state-msg {
  text-align: center;
  color: var(--text-muted);
  padding: 3rem 0;
  font-weight: 500;
}

.state-msg.error {
  color: #ef4444;
}

/* ---- 댓글 ---- */
.comment-card {
  margin-top: 1.25rem;
}

.comment-title {
  margin: 0 0 1rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
}

.comment-count {
  color: var(--active);
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}

.comment-form textarea,
.comment-edit-area {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  background: var(--bg);
  color: var(--text);
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease, background-color 0.25s ease;
}

.comment-form textarea:focus,
.comment-edit-area:focus {
  outline: none;
  border-color: var(--accent);
}

.comment-form-row {
  display: flex;
  gap: 0.6rem;
}

.comment-form-row input {
  flex: 1;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.65rem 1rem;
  background: var(--bg);
  color: var(--text);
  font-size: 0.9rem;
}

.comment-form-row input:focus {
  outline: none;
  border-color: var(--accent);
}

.comment-error {
  margin: 0;
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 500;
}

.comment-empty {
  color: var(--text-muted);
  text-align: center;
  padding: 1.5rem 0;
  font-size: 0.92rem;
}

.comment-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.comment-item {
  border-top: 1px solid var(--border);
  padding-top: 0.9rem;
}

.comment-content {
  margin: 0 0 0.5rem;
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--text);
  font-size: 0.98rem;
}

.comment-item-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.comment-date {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.comment-item-actions {
  display: flex;
  gap: 0.75rem;
}

.comment-edit-area {
  margin-bottom: 0.5rem;
}

.link-btn {
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.link-btn:hover:not(:disabled) {
  color: var(--accent);
}

.link-btn.danger:hover:not(:disabled) {
  color: #ef4444;
}

.link-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>