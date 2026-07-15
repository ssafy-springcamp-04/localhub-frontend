import axios from 'axios'
import locationsData from '../data/locations.json'

// API 계약서 §6 — VITE_USE_MOCK=true 면 이 문서 예시 JSON을 그대로 반환.
// 백엔드 완성 후 VITE_USE_MOCK=false + VITE_API_BASE_URL 교체만으로 전환.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

// 이름 가나다순 비교기 (한글 로케일)
const byName = (a, b) => a.title.localeCompare(b.title, 'ko')

/**
 * 지역정보 목록 조회 (계약서 §2-1, v1.1)
 * GET /api/locations?type=&q=&district=&sort=&page=&size=
 * @param {object} p
 * @param {string} p.type contentTypeId (필수)
 * @param {string} [p.q] 장소명 검색
 * @param {string} [p.district] 구별 필터
 * @param {'name'|'likes'} [p.sort] 정렬 (기본 name)
 * @returns {Promise<{items: Array, total: number, page: number, size: number}>}
 */
export async function getLocations({ type, q = '', district = '', sort = 'name', page = 1, size = 12 } = {}) {
  if (USE_MOCK) {
    let items = locationsData.filter((item) => item.content_type_id === type)
    if (q) {
      const keyword = q.toLowerCase()
      items = items.filter((item) => item.title.toLowerCase().includes(keyword))
    }
    if (district) {
      items = items.filter((item) => item.district === district)
    }
    // 정렬: likes(추천 순, 동률 시 이름순) / name(이름 가나다순)
    items = [...items].sort(
      sort === 'likes' ? (a, b) => b.likes - a.likes || byName(a, b) : byName
    )
    const total = items.length
    const start = (page - 1) * size
    return { items: items.slice(start, start + size), total, page, size }
  }

  const { data } = await axios.get(`${API_BASE}/api/locations`, {
    params: {
      type,
      q: q || undefined,
      district: district || undefined,
      sort,
      page,
      size
    }
  })
  return data
}

/**
 * 구(district) 목록 조회 — 필터 드롭다운용 (계약서 §2-5)
 * GET /api/locations/districts?type=
 * @returns {Promise<{items: string[]}>}  ("전체"는 프론트가 자체 추가)
 */
export async function getDistricts(type) {
  if (USE_MOCK) {
    const set = new Set(
      locationsData
        .filter((item) => (type ? item.content_type_id === type : true))
        .map((item) => item.district)
        .filter(Boolean)
    )
    return { items: [...set].sort((a, b) => a.localeCompare(b, 'ko')) }
  }

  const { data } = await axios.get(`${API_BASE}/api/locations/districts`, {
    params: { type: type || undefined }
  })
  return data
}

/**
 * 지역정보 좋아요 (계약서 §2-4)
 * POST /api/locations/{id}/like — 단순 카운트 증가
 * @returns {Promise<{id: number, likes: number}>}
 */
export async function likeLocation(id) {
  if (USE_MOCK) {
    const item = locationsData.find((it) => String(it.id) === String(id))
    if (!item) throw { response: { status: 404, data: { detail: '장소를 찾을 수 없습니다.' } } }
    item.likes += 1
    return { id: item.id, likes: item.likes }
  }

  const { data } = await axios.post(`${API_BASE}/api/locations/${id}/like`)
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
