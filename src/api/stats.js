import axios from 'axios'
import locationsData from '../data/locations.json'

// 대시보드 통계 — 자체 DB 집계(GET /api/stats).
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const CATEGORY_LABELS = {
  '12': '관광지', '14': '문화시설', '15': '축제공연행사', '25': '여행코스',
  '28': '레포츠', '32': '숙박', '38': '쇼핑', '39': '음식점'
}

/**
 * 대시보드 통계 조회.
 * @returns {Promise<{totals, locations_by_category, locations_by_district, top_liked, posts_by_category, festivals_by_month}>}
 */
export async function getStats() {
  if (USE_MOCK) {
    // 목 모드: 목 데이터(locations.json) 기반 경량 집계 (게시글/축제 월별은 생략)
    const byCat = {}
    const byDist = {}
    for (const it of locationsData) {
      byCat[it.content_type_id] = (byCat[it.content_type_id] || 0) + 1
      if (it.district) byDist[it.district] = (byDist[it.district] || 0) + 1
    }
    const locations_by_category = Object.entries(byCat)
      .map(([code, count]) => ({ code, label: CATEGORY_LABELS[code] || code, count }))
      .sort((a, b) => b.count - a.count)
    const locations_by_district = Object.entries(byDist)
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    const top_liked = [...locationsData]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 10)
      .map((it) => ({ title: it.title, likes: it.likes || 0 }))
    return {
      totals: {
        locations: locationsData.length,
        posts: 0,
        festivals: byCat['15'] || 0,
        likes_sum: locationsData.reduce((s, i) => s + (i.likes || 0), 0)
      },
      locations_by_category,
      locations_by_district,
      top_liked,
      posts_by_category: [],
      festivals_by_month: []
    }
  }

  const { data } = await axios.get(`${API_BASE}/api/stats`)
  return data
}
