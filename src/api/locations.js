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
 * 지도 핀 데이터 조회 (경량, 계약서 §2-2)
 * GET /api/locations/map?types={comma_separated}&district={district}&limit={limit}
 * 좌표(mapx/mapy) 있는 항목만, 페이지네이션 없음.
 * @param {object} p
 * @param {string} [p.types] 콤마 구분 타입 (예: "12,38"). 미지정 시 전체.
 * @param {string} [p.district] 구별 필터 (예: "종로구"). 미지정 시 전체.
 * @param {number} [p.limit] 상한 (기본 500 — 핀 과다로 인한 브라우저 멈춤 방지)
 * @returns {Promise<{items: Array<{id, content_type_id, title, mapx, mapy}>, total: number}>}
 */
export async function getMapPins({ types = '', district = '', limit = 500 } = {}) {
  if (USE_MOCK) {
    const typeList = types ? types.split(',').filter(Boolean) : null
    const items = locationsData
      .filter((it) => it.mapx != null && it.mapy != null)
      .filter((it) => (typeList ? typeList.includes(it.content_type_id) : true))
      .filter((it) => (district ? it.district === district : true))
      .slice(0, limit)
      .map((it) => ({
        id: it.id,
        content_type_id: it.content_type_id,
        title: it.title,
        mapx: it.mapx,
        mapy: it.mapy
      }))
    return { items, total: items.length }
  }

  const { data } = await axios.get(`${API_BASE}/api/locations/map`, {
    params: { types: types || undefined, district: district || undefined, limit }
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
