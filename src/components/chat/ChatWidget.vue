<template>
  <div class="chat-layer">
    <!-- 접힌 상태: 플로팅 버튼 -->
    <button
      v-if="!isOpen"
      class="chat-fab"
      type="button"
      aria-label="챗봇 열기"
      @click="open"
    >
      💬
    </button>

    <!-- 펼친 상태: 대화창 (모바일에서는 전체화면) -->
    <div v-else class="chat-panel" role="dialog" aria-label="서울 여행 챗봇">
      <header class="chat-panel__header">
        <span class="chat-panel__title">서울 여행 챗봇</span>
        <button
          class="chat-panel__close"
          type="button"
          aria-label="챗봇 닫기"
          @click="close"
        >
          ✕
        </button>
      </header>

      <div ref="scrollEl" class="chat-panel__messages">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['bubble', message.role]"
        >
          <p>{{ message.text }}</p>
        </div>

        <div v-if="isLoading" class="bubble assistant">
          <p class="typing"><span></span><span></span><span></span></p>
        </div>

        <div v-if="errorText" class="chat-error">
          <span>{{ errorText }}</span>
          <button type="button" @click="retry">다시 시도</button>
        </div>
      </div>

      <form class="chat-panel__input" @submit.prevent="handleSend">
        <input
          v-model="inputText"
          type="text"
          placeholder="질문을 입력하세요"
          :disabled="isLoading"
        />
        <button type="submit" :disabled="isLoading || !inputText.trim()">
          전송
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { sendChatMessage } from '../../api/chat.js'

const isOpen = ref(false)
const isLoading = ref(false)
const errorText = ref('')
const inputText = ref('')
const scrollEl = ref(null)

// 대화 히스토리 유지 (위젯이 열려 있는 동안 계속 누적)
const messages = ref([
  { role: 'assistant', text: '안녕하세요! 서울 여행에 대해 무엇이든 물어보세요.' }
])

let lastQuestion = ''

function open() {
  isOpen.value = true
  scrollToBottom()
}

function close() {
  isOpen.value = false
}

async function scrollToBottom() {
  await nextTick()
  if (scrollEl.value) {
    scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  }
}

async function ask(text) {
  isLoading.value = true
  errorText.value = ''
  try {
    // 계약서 §3-1: history 는 {role, content} 형태, 최대 10턴만 전송(토큰 절약)
    const history = messages.value
      .map((m) => ({ role: m.role, content: m.text }))
      .slice(-10)
    const { reply } = await sendChatMessage(text, history)
    messages.value.push({ role: 'assistant', text: reply })
  } catch (err) {
    // 503 등 서버 detail 메시지를 그대로 노출 (계약서 §3-1)
    errorText.value =
      err.response?.data?.detail ??
      '답변을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

function handleSend() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  messages.value.push({ role: 'user', text })
  inputText.value = ''
  lastQuestion = text
  scrollToBottom()
  ask(text)
}

function retry() {
  if (lastQuestion) ask(lastQuestion)
}
</script>

<style scoped>
.chat-layer {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  z-index: 1000;
}

/* 플로팅 버튼 - 포인트 초록색 반영 */
.chat-fab {
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 50%;
  background: var(--accent);
  color: #ffffff;
  font-size: 1.6rem;
  cursor: pointer;
  box-shadow: 0 8px 24px var(--shadow);
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.chat-fab:hover {
  transform: scale(1.05);
  background: var(--accent-strong);
}

/* 챗봇 본체 패널 */
.chat-panel {
  display: flex;
  flex-direction: column;
  width: min(380px, calc(100vw - 3rem));
  height: min(560px, calc(100vh - 3rem));
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 48px var(--shadow);
  color: var(--text);
  transition: background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.chat-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: var(--surface-strong);
  border-bottom: 1px solid var(--border);
}

.chat-panel__title {
  font-weight: 700;
  color: var(--text);
  font-size: 1rem;
}

.chat-panel__close {
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 1.1rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.chat-panel__close:hover {
  color: var(--text);
}

.chat-panel__messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  overflow-y: auto;
  background: var(--bg);
  transition: background-color 0.25s ease;
}

/* 말풍선 공통 */
.bubble {
  padding: 0.75rem 1rem;
  border-radius: 16px;
  max-width: 85%;
  line-height: 1.5;
  font-size: 0.95rem;
  word-break: break-all;
}

.bubble p {
  margin: 0;
}

/* 어시스턴트(AI) 말풍선 - 연한 브랜드 컬러 배경 */
.bubble.assistant {
  background: var(--accent-soft);
  color: var(--text);
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

/* 사용자 말풍선 - 배경 차이를 주어 구분선 강화 */
.bubble.user {
  background: var(--surface-strong);
  border: 1px solid var(--border);
  color: var(--text);
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}

/* 타이핑 대기 애니메이션 */
.typing {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 20px;
}

.typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  animation: blink 1.2s infinite ease-in-out;
}

.typing span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%, 80%, 100% {
    opacity: 0.3;
  }
  40% {
    opacity: 1;
  }
}

/* 에러 영역 */
.chat-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  font-size: 0.9rem;
}

.chat-error button {
  border: none;
  background: #ef4444;
  color: #ffffff;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.chat-error button:hover {
  background: #dc2626;
}

/* 입력 공간 */
.chat-panel__input {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--surface);
  border-top: 1px solid var(--border);
  transition: background-color 0.25s ease, border-color 0.25s ease;
}

.chat-panel__input input {
  flex: 1;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.7rem 1.1rem;
  background: var(--bg);
  color: var(--text);
  font-size: 0.95rem;
  transition: border-color 0.2s ease, background-color 0.25s ease;
}

.chat-panel__input input:focus {
  outline: none;
  border-color: var(--accent);
}

.chat-panel__input button {
  border: none;
  background: var(--accent);
  color: #ffffff;
  border-radius: 999px;
  padding: 0.7rem 1.25rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.chat-panel__input button:hover:not(:disabled) {
  background: var(--accent-strong);
}

.chat-panel__input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 모바일 전체화면 */
@media (max-width: 640px) {
  .chat-layer {
    right: 1rem;
    bottom: 1rem;
  }

  .chat-panel {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    border: none;
    border-radius: 0;
  }
}
</style>