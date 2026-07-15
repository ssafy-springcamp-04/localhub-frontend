<template>
  <section>
    <div class="card">
      <h1>챗봇</h1>
      <p>서울 여행 정보를 챗봇으로 대화하며 찾아보세요.</p>
    </div>
  </section>

  <section>
    <div class="chatbot-widget">
      <div class="chat-header" @click="toggleOpen">
        <span>서울 여행 챗봇</span>
        <button>{{ isOpen ? '접기' : '열기' }}</button>
      </div>

      <div v-if="isOpen" class="chat-content">
        <div class="messages">
          <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
            <p>{{ message.text }}</p>
          </div>
        </div>

        <div class="chat-input-row">
          <input v-model="inputText" placeholder="질문을 입력하세요" @keyup.enter="sendMessage" />
          <button @click="sendMessage">전송</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
const inputText = ref('')
const messages = ref([
  { role: 'assistant', text: '안녕하세요! 서울 여행을 도와드릴게요.' }
])

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function sendMessage() {
  const text = inputText.value.trim()
  if (!text) return

  messages.value.push({ role: 'user', text })
  messages.value.push({ role: 'assistant', text: '아직 챗봇 연결이 구현 중입니다. 곧 보여드릴게요!' })
  inputText.value = ''
}
</script>

<style scoped>
.chatbot-widget {
  position: relative;
  width: min(480px, 100%);
  margin: 0 auto;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.2rem;
  background: rgba(15, 23, 42, 0.95);
  cursor: pointer;
}

.chat-header button {
  border: none;
  background: #38bdf8;
  color: #0f172a;
  padding: 0.6rem 1rem;
  border-radius: 999px;
  cursor: pointer;
}

.chat-content {
  padding: 1.2rem;
}

.messages {
  display: grid;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.message {
  padding: 1rem;
  border-radius: 18px;
  max-width: 85%;
}

.message.assistant {
  background: rgba(59, 130, 246, 0.18);
  align-self: flex-start;
}

.message.user {
  background: rgba(15, 23, 42, 0.95);
  align-self: flex-end;
}

.chat-input-row {
  display: flex;
  gap: 0.75rem;
}

.chat-input-row input {
  flex: 1;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 999px;
  padding: 0.95rem 1rem;
  background: rgba(255,255,255,0.05);
  color: #f8fafc;
}

.chat-input-row button {
  border: none;
  background: #38bdf8;
  color: #0f172a;
  border-radius: 999px;
  padding: 0.95rem 1.2rem;
  cursor: pointer;
}

@media (max-width: 640px) {
  .chatbot-widget {
    width: 100%;
  }
}
</style>
