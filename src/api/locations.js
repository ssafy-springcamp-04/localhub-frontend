import axios from 'axios'
import locationsData from '../data/locations.json'

// API 계약서 §6 — VITE_USE_MOCK=true 면 이 문서 예시 JSON을 그대로 반환.
// 백엔드 완성 후 VITE_USE_MOCK=false + VITE_API_BASE_URL 교체만으로 전환.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

/**
 * 지역정보 목록 조회 (계약서 §2-1)
 * GET /api/locations?type={content_type_id}&q={keyword}&page={page}&size={size}
 * @returns {Promise<{items: Array, total: number, page: number, size: number}>}
 */
export async function getLocations({ type, q = '', page = 1, size = 12 } = {}) {
  if (USE_MOCK) {
    let items = locationsData.filter((item) => item.content_type_id === type)
    if (q) {
      const keyword = q.toLowerCase()
      items = items.filter((item) => item.title.toLowerCase().includes(keyword))
    }
    const total = items.length
    const start = (page - 1) * size
    return { items: items.slice(start, start + size), total, page, size }
  }

  const { data } = await axios.get(`${API_BASE}/api/locations`, {
    params: { type, q: q || undefined, page, size }
  })
  return data
}

/**
 * 지역정보 단건 조회 (계약서 §2-3)
 * GET /api/locations/{id}
 */
export async function getLocation(id) {
  if (USE_MOCK) {
    return locationsData.find((item) => String(item.id) === String(id)) ?? null
  }

  const { data } = await axios.get(`${API_BASE}/api/locations/${id}`)
  return data
}
