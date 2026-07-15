<template>
  <section>
    <div class="card">
      <div class="form-head">
        <h1>{{ isEdit ? '게시글 수정' : '새 글 작성' }}</h1>
        <router-link class="back-link" :to="backTo">← 취소</router-link>
      </div>

      <p v-if="needVerify" class="state-msg">
        수정 권한 확인이 필요합니다. 비밀번호를 입력해 주세요.
      </p>

      <form v-else class="post-form" @submit.prevent="submit">
        <label>
          <span>카테고리</span>
          <select v-model="form.category" required>
            <option value="" disabled>카테고리 선택</option>
            <option v-for="c in categories" :key="c.code" :value="c.code">{{ c.label }}</option>
          </select>
        </label>

        <label>
          <span>제목</span>
          <input v-model="form.title" maxlength="100" placeholder="제목 (1~100자)" required />
        </label>

        <label>
          <span>내용</span>
          <textarea v-model="form.content" rows="8" placeholder="내용을 입력하세요" required></textarea>
        </label>

        <label v-if="!isEdit">
          <span>비밀번호</span>
          <input
            v-model="form.password"
            type="password"
            minlength="4"
            maxlength="20"
            placeholder="수정·삭제에 사용할 비밀번호 (4~20자)"
            required
          />
        </label>

        <p v-if="errorText" class="form-error">{{ errorText }}</p>

        <div class="form-actions">
          <router-link class="btn ghost" :to="backTo">취소</router-link>
          <button class="btn primary" type="submit" :disabled="submitting">
            {{ submitting ? '저장 중…' : isEdit ? '수정 완료' : '작성 완료' }}
          </button>
        </div>
      </form>
    </div>
  </section>

  <!-- 새로고침 등으로 검증 상태가 사라졌을 때 복구용 -->
  <PasswordModal
    v-if="needVerify"
    title="수정 전 확인"
    description="수정하려면 작성 시 비밀번호를 입력하세요."
    :on-submit="recoverVerify"
    @close="router.replace({ name: 'community-detail', params: { id } })"
    @success="onRecovered"
  />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createPost, updatePost, verifyPassword, getPost } from '../../api/posts.js'
import { CATEGORIES } from '../../constants/categories.js'
import PasswordModal from '../../components/community/PasswordModal.vue'

const route = useRoute()
const router = useRouter()

const categories = CATEGORIES
const isEdit = computed(() => route.name === 'community-edit')
const id = computed(() => route.params.id)

const form = reactive({ category: '', title: '', content: '', password: '' })
const verifiedPassword = ref('')
const needVerify = ref(false)
const submitting = ref(false)
const errorText = ref('')

const backTo = computed(() =>
  isEdit.value
    ? { name: 'community-detail', params: { id: id.value } }
    : { name: 'community-list' }
)

function fillForm(post) {
  form.category = post.category
  form.title = post.title
  form.content = post.content
}

onMounted(() => {
  if (!isEdit.value) return
  // 상세 화면에서 검증 후 전달된 비밀번호 + 게시글 스냅샷 사용
  const state = window.history.state || {}
  if (state.password && state.post) {
    verifiedPassword.value = state.password
    fillForm(state.post)
  } else {
    // 직접 접근/새로고침 → 비밀번호 재검증 필요
    needVerify.value = true
  }
})

// 복구 플로우: 비밀번호 검증
function recoverVerify(password) {
  return verifyPassword(id.value, password)
}

async function onRecovered({ password }) {
  verifiedPassword.value = password
  needVerify.value = false
  try {
    // 검증 통과 후 최신 데이터로 폼 채우기
    const post = await getPost(id.value)
    fillForm(post)
  } catch (err) {
    errorText.value = '게시글을 불러오지 못했습니다.'
  }
}

async function submit() {
  if (submitting.value) return
  submitting.value = true
  errorText.value = ''
  try {
    if (isEdit.value) {
      await updatePost(id.value, {
        password: verifiedPassword.value,
        category: form.category,
        title: form.title.trim(),
        content: form.content.trim()
      })
      router.replace({ name: 'community-detail', params: { id: id.value } })
    } else {
      const created = await createPost({
        category: form.category,
        title: form.title.trim(),
        content: form.content.trim(),
        password: form.password
      })
      router.replace({ name: 'community-detail', params: { id: created.id } })
    }
  } catch (err) {
    errorText.value =
      err.response?.data?.detail ?? '저장에 실패했습니다. 입력값을 확인해 주세요.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.form-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.back-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
}

.post-form {
  display: grid;
  gap: 1.2rem;
}

.post-form label {
  display: grid;
  gap: 0.5rem;
}

.post-form label span {
  font-size: 0.9rem;
  color: #cbd5e1;
}

.post-form select,
.post-form input,
.post-form textarea {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
  font: inherit;
  resize: vertical;
}

.form-error {
  color: #fca5a5;
  font-size: 0.9rem;
  margin: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.btn {
  border: none;
  border-radius: 999px;
  padding: 0.75rem 1.4rem;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn.primary {
  background: #38bdf8;
  color: #0f172a;
}

.btn.ghost {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.state-msg {
  text-align: center;
  color: #94a3b8;
  padding: 2rem 0;
}
</style>
