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

.chat-fab {
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 50%;
  background: #38bdf8;
  color: #0f172a;
  font-size: 1.6rem;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.chat-panel {
  display: flex;
  flex-direction: column;
  width: min(380px, calc(100vw - 3rem));
  height: min(560px, calc(100vh - 3rem));
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
}

.chat-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.1rem;
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.chat-panel__title {
  font-weight: 700;
}

.chat-panel__close {
  border: none;
  background: transparent;
  color: #cbd5e1;
  font-size: 1.1rem;
  cursor: pointer;
}

.chat-panel__messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem;
  overflow-y: auto;
}

.bubble {
  padding: 0.7rem 0.9rem;
  border-radius: 16px;
  max-width: 85%;
  line-height: 1.45;
}

.bubble p {
  margin: 0;
}

.bubble.assistant {
  background: rgba(59, 130, 246, 0.18);
  align-self: flex-start;
}

.bubble.user {
  background: rgba(148, 163, 184, 0.22);
  align-self: flex-end;
}

.typing {
  display: inline-flex;
  gap: 4px;
}

.typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #93c5fd;
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

.chat-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.6rem 0.8rem;
  border-radius: 12px;
  background: rgba(248, 113, 113, 0.15);
  color: #fecaca;
  font-size: 0.9rem;
}

.chat-error button {
  border: none;
  background: #f87171;
  color: #450a0a;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}

.chat-panel__input {
  display: flex;
  gap: 0.5rem;
  padding: 0.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.chat-panel__input input {
  flex: 1;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 999px;
  padding: 0.7rem 0.9rem;
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
}

.chat-panel__input button {
  border: none;
  background: #38bdf8;
  color: #0f172a;
  border-radius: 999px;
  padding: 0.7rem 1rem;
  cursor: pointer;
}

.chat-panel__input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 모바일: 전체 화면 전환 (RFP 명시 요구) */
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
