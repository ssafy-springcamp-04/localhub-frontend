<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal" role="dialog" aria-modal="true">
      <h3 class="modal-title">{{ title }}</h3>
      <p class="modal-desc">{{ description }}</p>

      <form @submit.prevent="submit">
        <input
          ref="inputEl"
          v-model="password"
          type="password"
          placeholder="비밀번호 (4~20자)"
          :disabled="loading"
        />
        <p v-if="error" class="modal-error">{{ error }}</p>

        <div class="modal-actions">
          <button type="button" class="btn ghost" :disabled="loading" @click="$emit('close')">
            취소
          </button>
          <button type="submit" class="btn primary" :disabled="loading || !password.trim()">
            {{ loading ? '확인 중…' : confirmLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  title: { type: String, default: '비밀번호 확인' },
  description: { type: String, default: '작성 시 입력한 비밀번호를 입력하세요.' },
  confirmLabel: { type: String, default: '확인' },
  // 부모가 넘겨주는 비동기 검증 함수. (password) => Promise. 실패 시 throw.
  onSubmit: { type: Function, required: true }
})

const emit = defineEmits(['close', 'success'])

const password = ref('')
const loading = ref(false)
const error = ref('')
const inputEl = ref(null)

onMounted(() => inputEl.value?.focus())

async function submit() {
  const value = password.value.trim()
  if (!value || loading.value) return
  loading.value = true
  error.value = ''
  try {
    const result = await props.onSubmit(value)
    emit('success', { password: value, result })
  } catch (err) {
    error.value = err.response?.data?.detail ?? '요청을 처리하지 못했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 모달 배후 레이어 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(13, 21, 16, 0.75); /* 테마에 맞춰 딥 그린이 가미된 어두운 투명 백드롭 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1100;
  backdrop-filter: blur(4px); /* 뒷배경을 부드럽게 뭉개 입체감 상승 */
}

/* 모달 본체 */
.modal {
  width: min(420px, 100%);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 1.75rem;
  box-shadow: 0 20px 50px var(--shadow);
  color: var(--text);
  transition: background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.modal-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.modal-desc {
  margin: 0 0 1.25rem;
  color: var(--text-muted);
  font-size: 0.92rem;
  line-height: 1.45;
}

/* 비밀번호 입력창 */
.modal input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.8rem 1rem;
  background: var(--bg);
  color: var(--text);
  font-size: 0.95rem;
  transition: border-color 0.2s ease, background-color 0.25s ease;
}

.modal input:focus {
  outline: none;
  border-color: var(--accent);
}

/* 에러 텍스트 */
.modal-error {
  color: #ef4444; /* 명확한 경고용 레드 */
  font-size: 0.85rem;
  margin: 0.6rem 0 0;
  font-weight: 500;
}

/* 액션 버튼 그룹 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1.5rem;
}

.btn {
  border: none;
  border-radius: 999px;
  padding: 0.7rem 1.25rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

/* 확인 (초록 포인트) 버튼 */
.btn.primary {
  background: var(--accent);
  color: #ffffff;
}

.btn.primary:hover:not(:disabled) {
  background: var(--accent-strong);
}

/* 취소 버튼 */
.btn.ghost {
  background: var(--surface-strong);
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.btn.ghost:hover:not(:disabled) {
  color: var(--text);
  background: var(--border);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>