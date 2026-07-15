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
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1100;
}

.modal {
  width: min(420px, 100%);
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 1.5rem;
}

.modal-title {
  margin: 0 0 0.5rem;
}

.modal-desc {
  margin: 0 0 1rem;
  color: #94a3b8;
  font-size: 0.92rem;
}

.modal input {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
}

.modal-error {
  color: #fca5a5;
  font-size: 0.9rem;
  margin: 0.6rem 0 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1.2rem;
}

.btn {
  border: none;
  border-radius: 999px;
  padding: 0.7rem 1.2rem;
  cursor: pointer;
  font-weight: 600;
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
</style>
