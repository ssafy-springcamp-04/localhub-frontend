import axios from 'axios'

// API 계약서 §6 — VITE_USE_MOCK=true 면 목 응답 반환.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const MOCK_ANSWERS = [
  {
    match: /축제|행사|공연/,
    reply: '이번 주말 서울에는 여의도 봄꽃축제와 서울숲 재즈페스티벌이 예정되어 있어요. 지역정보의 "축제공연행사" 목록에서 일정을 확인해 보세요.'
  },
  {
    match: /맛집|음식|식당|먹/,
    reply: '광장시장의 빈대떡, 익선동 골목의 퓨전 한식이 방문객에게 인기가 많아요. 지역정보의 "음식점" 탭에서 위치를 확인할 수 있어요.'
  },
  {
    match: /관광|여행|가볼|명소|구경/,
    reply: '경복궁, 북촌한옥마을, 남산서울타워가 대표 관광지예요. 지역정보의 "관광지" 목록에서 주소와 사진을 볼 수 있어요.'
  },
  {
    match: /숙박|호텔|숙소|잘/,
    reply: '명동·홍대 인근에 접근성 좋은 숙소가 많아요. 지역정보의 "숙박" 탭에서 살펴보세요.'
  }
]

function mockReply(text) {
  const found = MOCK_ANSWERS.find((item) => item.match.test(text))
  return found
    ? found.reply
    : '아직 준비 중인 질문이에요. 축제, 맛집, 관광지, 숙박에 대해 물어봐 주시면 도와드릴게요!'
}   

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 챗봇 질의 (계약서 §3-1)
 * POST /api/chat  요청 { message, history:[{role, content}] }
 * @param {string} message 사용자 입력 (1~500자)
 * @param {Array<{role: string, content: string}>} history 이전 대화 (최대 10턴)
 * @returns {Promise<{reply: string, sources: Array}>}
 */
export async function sendChatMessage(message, history = []) {
  if (USE_MOCK) {
    await delay(600) // 로딩 상태 확인용 지연
    return { reply: mockReply(message), sources: [] }
  }

  const { data } = await axios.post(`${API_BASE}/api/chat`, {
    message,
    history
  })
  return { reply: data.reply ?? '', sources: data.sources ?? [] }
}
