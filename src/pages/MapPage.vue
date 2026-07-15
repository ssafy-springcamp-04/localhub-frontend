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
        placeholder="장소명 또는 주소(구)를 입력하세요... (예: 경복궁, 강남)" 
        @input="handleSearch"
      />
      <button v-if="searchQuery" class="clear-btn" @click="clearSearch">✕</button>
    </div>
  </section>

  <!-- 가로로 나열되는 구 선택 토글 바 영역 -->
  <section class="filter-wrapper">
    <div class="filter-container">
      <button 
        v-for="district in districts" 
        :key="district"
        :class="['filter-btn', { active: selectedDistrict === district }]"
        @click="selectDistrict(district)"
      >
        {{ district }}
      </button>
    </div>
  </section>

  <section class="map-card">
    <!-- 지도가 실제로 그려질 영역 -->
    <div ref="mapContainer" class="map-container"></div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const mapContainer = ref(null)
let mapInstance = null
let activeMarkers = [] // 화면에 그려진 마커들을 추적하고 지우기 위한 배열

const districts = ref([])
const selectedDistrict = ref('전체')

// 검색어 반응형 변수 정의
const searchQuery = ref('')

// 서울 주요 랜드마크 20개 대량 더미 데이터
const defaultPlaces = [
  // 종로구 (5곳)
  { id: 1, title: '경복궁', latitude: 37.5796, longitude: 126.9770, gu: '종로구' },
  { id: 2, title: '창덕궁', latitude: 37.5794, longitude: 126.9910, gu: '종로구' },
  { id: 3, title: '인사동 쌈지길', latitude: 37.5742, longitude: 126.9847, gu: '종로구' },
  { id: 4, title: '북촌한옥마을', latitude: 37.5829, longitude: 126.9835, gu: '종로구' },
  { id: 5, title: '광화문광장', latitude: 37.5721, longitude: 126.9769, gu: '종로구' },

  // 용산구 (4곳)
  { id: 6, title: 'N서울타워', latitude: 37.5511, longitude: 126.9882, gu: '용산구' },
  { id: 7, title: '전쟁기념관', latitude: 37.5366, longitude: 126.9771, gu: '용산구' },
  { id: 8, title: '국립중앙박물관', latitude: 37.5238, longitude: 126.9798, gu: '용산구' },
  { id: 9, title: '이태원 세계음식거리', latitude: 37.5349, longitude: 126.9942, gu: '용산구' },

  // 송파구 (3곳)
  { id: 10, title: '롯데월드타워', latitude: 37.5125, longitude: 127.1025, gu: '송파구' },
  { id: 11, title: '석촌호수', latitude: 37.5098, longitude: 127.1031, gu: '송파구' },
  { id: 12, title: '올림픽공원', latitude: 37.5207, longitude: 127.1215, gu: '송파구' },

  // 마포구 (4곳)
  { id: 13, title: '홍대 걷고싶은거리', latitude: 37.5562, longitude: 126.9239, gu: '마포구' },
  { id: 14, title: '망원시장', latitude: 37.5561, longitude: 126.9059, gu: '마포구' },
  { id: 15, title: '하늘공원', latitude: 37.5681, longitude: 126.8848, gu: '마포구' },
  { id: 16, title: '경의선 숲길', latitude: 37.5585, longitude: 126.9378, gu: '마포구' },

  // 강남구 (4곳)
  { id: 17, title: '코엑스몰', latitude: 37.5118, longitude: 127.0592, gu: '강남구' },
  { id: 18, title: '가로수길', latitude: 37.5212, longitude: 127.0230, gu: '강남구' },
  { id: 19, title: '봉은사', latitude: 37.5144, longitude: 127.0573, gu: '강남구' },
  { id: 20, title: '강남역 네거리', latitude: 37.4980, longitude: 127.0276, gu: '강남구' }
]

onMounted(async () => {
  await nextTick()

  const uniqueGus = [...new Set(defaultPlaces.map(place => place.gu))].sort()
  districts.value = ['전체', ...uniqueGus]

  if (window.kakao && window.kakao.maps) {
    initMap(defaultPlaces)
  } else {
    console.error("Kakao Maps API가 아직 로드되지 않았습니다.")
  }
})

const initMap = (places) => {
  const container = mapContainer.value
  if (!container) return
  
  const options = {
    center: new window.kakao.maps.LatLng(37.5665, 126.9780),
    level: 7
  }

  mapInstance = new window.kakao.maps.Map(container, options)
  updateMarkers(places)
}

// 검색 및 토글 필터를 결합하여 데이터를 가공하는 핵심 함수
const getFilteredPlaces = () => {
  return defaultPlaces.filter(place => {
    // 구 토글 조건
    const matchesDistrict = selectedDistrict.value === '전체' || place.gu === selectedDistrict.value
    
    // 검색창 입력 조건 (이름 검색 및 주소/구 이름 매칭 허용)
    const normalizedQuery = searchQuery.value.trim().toLowerCase()
    const matchesQuery = !normalizedQuery || 
                         place.title.toLowerCase().includes(normalizedQuery) || 
                         place.gu.toLowerCase().includes(normalizedQuery)

    return matchesDistrict && matchesQuery
  })
}

// 구 토글 클릭 시
const selectDistrict = (district) => {
  selectedDistrict.value = district
  updateMarkers(getFilteredPlaces())
}

// 실시간 검색 타이핑 시 이벤트 처리
const handleSearch = () => {
  updateMarkers(getFilteredPlaces())
}

// 검색어 지우기 버튼 액션
const clearSearch = () => {
  searchQuery.value = ''
  updateMarkers(getFilteredPlaces())
}

const updateMarkers = (places) => {
  if (!mapInstance) return

  // 기존 마커와 인포윈도우 제거
  activeMarkers.forEach(item => {
    item.marker.setMap(null)
    if (item.infowindow) item.infowindow.close()
  })
  activeMarkers = []

  const bounds = new window.kakao.maps.LatLngBounds()
  
  const markerImageSrc = 'https://cdn-icons-png.flaticon.com/512/684/684908.png'
  const imageSize = new window.kakao.maps.Size(36, 36)
  const imageOption = { offset: new window.kakao.maps.Point(18, 36) }
  const markerImage = new window.kakao.maps.MarkerImage(markerImageSrc, imageSize, imageOption)

  places.forEach((place) => {
    const markerPosition = new window.kakao.maps.LatLng(place.latitude, place.longitude)

    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
      image: markerImage,
      map: mapInstance
    })

    const infowindow = new window.kakao.maps.InfoWindow({
      content: `<div class="info-window">${place.title}</div>`
    })

    window.kakao.maps.event.addListener(marker, 'mouseover', () => {
      infowindow.open(mapInstance, marker)
    })

    window.kakao.maps.event.addListener(marker, 'mouseout', () => {
      infowindow.close()
    })

    activeMarkers.push({ marker, infowindow })
    bounds.extend(markerPosition)
  })

  // 선택된 핀들의 범위에 맞춰 뷰포트 자동 세팅
  if (places.length > 0) {
    mapInstance.setBounds(bounds)
    
    // 특정 구 필터 혹은 검색 결과가 몇 개 없을 때 가장 이쁜 축척 유지
    if (places.length > 1 && places.length < 5) {
      mapInstance.setLevel(6)
    } else if (places.length === 1) {
      mapInstance.setLevel(5)
    }
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