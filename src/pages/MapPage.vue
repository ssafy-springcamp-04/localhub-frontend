<template>
  <section>
    <div class="card">
      <h1>지도</h1>
      <p>서울의 주요 관광지와 명소를 지도에서 확인하세요.</p>
    </div>
  </section>

  <!-- 실시간 검색창 영역 -->
  <section class="search-wrapper">
    <div class="search-container">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="장소명을 입력하세요... (예: 경복궁, 롯데월드)"
        @input="handleSearch"
      />
      <button v-if="searchQuery" class="clear-btn" @click="clearSearch">✕</button>
    </div>
  </section>

  <!-- 카테고리(종류) 토글 바 영역 -->
  <section class="filter-wrapper">
    <div class="filter-container">
      <button
        v-for="opt in categoryOptions"
        :key="opt.code"
        :class="['filter-btn', { active: selectedType === opt.code }]"
        @click="selectCategory(opt.code)"
      >
        {{ opt.label }}
      </button>
    </div>
  </section>

  <!-- 구(區) 필터 드롭다운 -->
  <section class="district-wrapper">
    <select class="district-select" v-model="selectedDistrict" @change="selectDistrict">
      <option value="">전체 지역(구)</option>
      <option v-for="d in districtOptions" :key="d" :value="d">{{ d }}</option>
    </select>
  </section>

  <section class="map-card">
    <!-- 지도가 실제로 그려질 영역 -->
    <div ref="mapContainer" class="map-container"></div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { getMapPins, getDistricts } from '../api/locations.js'
import { CATEGORIES } from '../constants/categories.js'

const mapContainer = ref(null)
let mapInstance = null
let clusterer = null

// 카테고리(종류) 필터 (전체 + 8종), 구(區) 필터 (전체 + §2-5 목록)
const categoryOptions = [{ code: '', label: '전체' }, ...CATEGORIES]
const selectedType = ref('')
const districtOptions = ref([])
const selectedDistrict = ref('')
const searchQuery = ref('')

// 백엔드에서 불러온 좌표 보유 핀 원본
let allPins = []

onMounted(async () => {
  await nextTick()

  if (!(window.kakao && window.kakao.maps)) {
    console.error('Kakao Maps API가 아직 로드되지 않았습니다.')
    return
  }
  initMap()
  await loadDistricts('')
  await loadPins() // 초기 로드: 서울 포커스 유지 (fitBounds 안 함)
})

const initMap = () => {
  const container = mapContainer.value
  if (!container) return

  // 초기 진입/새로고침 시 서울 중심을 포커스
  const options = {
    center: new window.kakao.maps.LatLng(37.5665, 126.9780),
    level: 8
  }
  mapInstance = new window.kakao.maps.Map(container, options)

  // 축척(레벨)별 자동 클러스터링 — minLevel 이상(축소)에서 묶이고, 확대하면 개별 핀
  // clusterer 라이브러리가 로드되지 않은 경우엔 null 로 두고 개별 마커로 폴백
  if (window.kakao.maps.MarkerClusterer) {
    clusterer = new window.kakao.maps.MarkerClusterer({
      map: mapInstance,
      averageCenter: true,
      minLevel: 6,
      gridSize: 80
    })
  } else {
    console.warn('MarkerClusterer 미로드 — 개별 마커로 표시합니다.')
  }
}

// 구 목록 로드 (계약서 §2-5) — 선택 타입에 존재하는 구만
const loadDistricts = async (type) => {
  try {
    districtOptions.value = (await getDistricts(type)).items
  } catch (err) {
    districtOptions.value = []
  }
}

// 핀 로드 — 경량 지도 핀 API(§2-2)로 타입/구 서버 필터. limit 상한으로 과다 핀 방지.
const loadPins = async () => {
  const type = selectedType.value
  const district = selectedDistrict.value
  try {
    const { items } = await getMapPins({ types: type || '', district, limit: 500 })
    // §2-2 는 좌표 있는 항목만 반환하지만 방어적으로 한 번 더 필터
    allPins = items.filter((p) => p.mapx != null && p.mapy != null)
  } catch (err) {
    allPins = []
  }
  // 구를 선택했을 때만 그 영역으로 확대, 그 외에는 서울 포커스 유지
  updateMarkers(getFilteredPins(), Boolean(district))
}

// 검색어(장소명)는 불러온 핀에서 클라이언트 측 필터
const getFilteredPins = () => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allPins
  return allPins.filter((p) => p.title.toLowerCase().includes(q))
}

// 카테고리 토글 클릭 → 구 목록 갱신 + 핀 재조회
const selectCategory = async (code) => {
  selectedType.value = code
  selectedDistrict.value = '' // 타입 바뀌면 구 필터 초기화
  await loadDistricts(code)
  loadPins()
}

// 구 드롭다운 변경 → 핀 재조회
const selectDistrict = () => {
  loadPins()
}

// 실시간 검색 타이핑 시 이벤트 처리
const handleSearch = () => {
  updateMarkers(getFilteredPins(), false)
}

// 검색어 지우기 버튼 액션
const clearSearch = () => {
  searchQuery.value = ''
  updateMarkers(getFilteredPins(), false)
}

let plainMarkers = [] // 클러스터러 미사용 시 개별 마커 추적

const updateMarkers = (pins, fit) => {
  if (!mapInstance) return

  // 기존 마커 제거 (클러스터러 사용/미사용 모두 대응)
  if (clusterer) {
    clusterer.clear()
  } else {
    plainMarkers.forEach((m) => m.setMap(null))
    plainMarkers = []
  }

  const bounds = new window.kakao.maps.LatLngBounds()

  const markers = pins.map((place) => {
    // 계약서: mapy = 위도(lat), mapx = 경도(lng)
    // 마커 이미지는 Kakao 기본 핀 사용 (외부 이미지 의존 제거 → 로드 실패 위험 없음)
    const position = new window.kakao.maps.LatLng(place.mapy, place.mapx)
    const marker = new window.kakao.maps.Marker({ position })

    const infowindow = new window.kakao.maps.InfoWindow({
      content: `<div class="info-window">${place.title}</div>`
    })
    window.kakao.maps.event.addListener(marker, 'mouseover', () =>
      infowindow.open(mapInstance, marker)
    )
    window.kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close())

    bounds.extend(position)
    return marker
  })

  // 클러스터러가 있으면 일괄 등록, 없으면 개별 마커를 직접 지도에 표시 (폴백)
  if (clusterer) {
    clusterer.addMarkers(markers)
  } else {
    markers.forEach((m) => m.setMap(mapInstance))
    plainMarkers = markers
  }

  // 구 선택 등 명시적 확대 요청 시에만 범위 맞춤
  if (fit && pins.length > 0) {
    mapInstance.setBounds(bounds)
  }
}
</script>

<style scoped>
/* 검색 바 디자인 */
.search-wrapper {
  margin-bottom: 12px;
  width: 100%;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0 16px;
  transition: all 0.25s ease;
}

/* 포커스 효과를 초록 테마로 조율 */
.search-container:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.search-icon {
  font-size: 16px;
  margin-right: 12px;
  color: var(--text-muted);
}

.search-container input {
  width: 100%;
  height: 48px;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 15px;
  font-weight: 500;
}

.search-container input::placeholder {
  color: var(--muted);
}

.clear-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  transition: color 0.15s;
}

.clear-btn:hover {
  color: var(--text);
}

/* 필터 슬라이더 바 스타일 */
.filter-wrapper {
  margin-bottom: 16px;
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.filter-wrapper::-webkit-scrollbar {
  display: none;
}

.filter-container {
  display: inline-flex;
  gap: 8px;
  padding: 4px 2px;
}

.filter-btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: var(--surface-strong);
  color: var(--text);
  border-color: var(--text-muted);
}

/* 필터 클릭 활성화 시 초록색 액센트 포인트 적용 */
.filter-btn.active {
  background: var(--accent);
  color: #ffffff;
  border-color: var(--accent);
  box-shadow: 0 4px 12px var(--shadow);
}

/* 구(區) 필터 드롭다운 */
.district-wrapper {
  margin-bottom: 16px;
  width: 100%;
}

.district-select {
  width: 100%;
  max-width: 260px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease;
}

.district-select:focus {
  border-color: var(--accent);
}

.map-card {
  min-height: 420px;
}

.map-container {
  width: 100%;
  min-height: 420px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--surface);
  box-shadow: 0 4px 16px var(--shadow);
}

:deep(.info-window) {
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b; /* 라이트/다크 및 기본 배경 판 레이아웃에 상관없이 잘 보이도록 어둡게 고정 */
  text-align: center;
  white-space: nowrap;
}
</style>