<template>
  <div class="home">
    <!-- 제목 박스 (왼쪽 정렬) -->
    <div class="card title-box">
      <h1>Seoul Explorer</h1>
      <p>서울의 관광·문화·쇼핑·숙박·축제 정보를 한 곳에서 확인하세요.</p>
    </div>

    <!-- 카드 박스 (카드별 색상) -->
    <div class="hero-cards">
      <router-link class="feature-card region" to="/categories">
        <h2>지역 정보</h2>
        <p>서울의 다양한 지역 데이터를 카테고리별로 살펴보세요.</p>
        <span class="feature-more">자세히 보기 →</span>
      </router-link>

      <router-link class="feature-card community" to="/community">
        <h2>커뮤니티</h2>
        <p>관광 계획, 리뷰, 질문을 공유하고 게시글을 관리할 수 있습니다.</p>
        <span class="feature-more">자세히 보기 →</span>
      </router-link>

      <router-link class="feature-card map" to="/map">
        <h2>지도</h2>
        <p>Leaflet 지도로 서울 주요 명소를 한눈에 확인하세요.</p>
        <span class="feature-more">자세히 보기 →</span>
      </router-link>
    </div>

    <section class="insight-grid">
      <div class="card weather-card">
        <div class="weather-header">
          <div>
            <p class="eyebrow">오늘의 서울</p>
            <h3>오늘 서울 날씨</h3>
          </div>
          <span class="weather-badge">{{ todayLabel }}</span>
        </div>

        <div v-if="weather" class="weather-main">
          <div class="weather-icon">{{ weather.icon }}</div>
          <div>
            <div class="weather-temp">{{ weather.temp }}°C</div>
            <div class="weather-desc">{{ weather.description }}</div>
          </div>
        </div>

        <div v-if="weather" class="weather-meta">
          <div>체감 {{ weather.feelsLike }}°C</div>
          <div>습도 {{ weather.humidity }}%</div>
          <div>바람 {{ weather.wind }}m/s</div>
        </div>
      </div>

      <div class="card trending-card">
        <div class="trending-header">
          <div>
            <p class="eyebrow">실시간 인기</p>
            <h3>추천 Top 10 장소</h3>
          </div>
          <span class="live-pill">LIVE</span>
        </div>

        <div v-if="trendingPlaces.length" class="ticker-viewport">
          <div class="ticker-track" :style="{ transform: `translateY(-${activeIndex * 74}px)` }">
            <div v-for="(place, index) in trendingPlaces" :key="place.title" class="ticker-slide">
              <div class="ticker-rank">{{ index + 1 }}</div>
              <div class="ticker-body">
                <div class="ticker-title">{{ place.title }}</div>
                <div class="ticker-meta">{{ place.likes }} 추천</div>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="empty-note">인기 장소 데이터를 불러오는 중입니다.</p>
      </div>
    </section>

    <!-- 사진 박스 (테마에 따라 라이트/다크 이미지 교체, 잘림 없음) -->
    <div class="card photo-box">
      <img class="hero-img" :src="heroSrc" alt="서울 전경 일러스트" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { isDarkTheme } from '../theme.js'
import { getStats } from '../api/stats.js'

// 테마에 따라 히어로 이미지 1장만 로드 (다크/라이트)
const heroSrc = computed(() => (isDarkTheme.value ? '/hero-bg-dark.png' : '/hero-bg.png'))
const todayLabel = computed(() =>
  new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date())
)

const weather = ref(null)
const trendingPlaces = ref([])
const activeIndex = ref(0)
let intervalId = null

function mapWeatherCode(code) {
  switch (code) {
    case 0:
      return '맑음'
    case 1:
    case 2:
    case 3:
      return '구름 많음'
    case 45:
    case 48:
      return '안개'
    case 51:
    case 53:
    case 55:
      return '이슬비'
    case 61:
    case 63:
    case 65:
      return '비'
    case 71:
    case 73:
    case 75:
      return '눈'
    case 95:
    case 96:
    case 99:
      return '천둥번개'
    default:
      return '흐림'
  }
}

function mapWeatherIcon(code) {
  switch (code) {
    case 0:
      return '☀️'
    case 1:
    case 2:
    case 3:
      return '☁️'
    case 45:
    case 48:
      return '🌫️'
    case 51:
    case 53:
    case 55:
    case 61:
    case 63:
    case 65:
      return '🌧️'
    case 71:
    case 73:
    case 75:
      return '❄️'
    case 95:
    case 96:
    case 99:
      return '⛈️'
    default:
      return '🌥️'
  }
}

async function fetchWeather() {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=Asia%2FSeoul'
    )
    const data = await res.json()
    const current = data.current || {}
    weather.value = {
      temp: Math.round(current.temperature_2m ?? 20),
      feelsLike: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 20),
      humidity: current.relative_humidity_2m ?? 58,
      wind: (current.wind_speed_10m ?? 2.1).toFixed(1),
      description: mapWeatherCode(current.weather_code ?? 1),
      icon: mapWeatherIcon(current.weather_code ?? 1)
    }
  } catch (err) {
    weather.value = { temp: 21, feelsLike: 22, humidity: 58, wind: '2.1', description: '맑음', icon: '☀️' }
  }
}

async function loadTrending() {
  try {
    const data = await getStats()
    const list = Array.isArray(data?.top_liked) ? data.top_liked.slice(0, 10) : []
    trendingPlaces.value = list
  } catch (err) {
    trendingPlaces.value = []
  }
}

onMounted(async () => {
  await Promise.all([fetchWeather(), loadTrending()])
  if (trendingPlaces.value.length > 1) {
    intervalId = setInterval(() => {
      activeIndex.value = (activeIndex.value + 1) % trendingPlaces.value.length
    }, 2600)
  }
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 제목 박스: 왼쪽 정렬 */
.title-box {
  text-align: left;
}

.title-box h1 {
  margin: 0 0 0.5rem;
  font-size: 2.4rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text);
}

.title-box p {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--text-muted);
}

/* 소개 카드 3열 */
.hero-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.feature-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  border-radius: 14px;
  text-decoration: none;
  background: var(--card-bg);
  border: 1px solid var(--border);
  /* 구분용 옅은 색 포인트 (상단 얇은 라인) */
  border-top: 3px solid var(--accent-soft);
  box-shadow: 0 6px 18px var(--shadow);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
  box-shadow: 0 12px 26px var(--shadow);
}

.feature-card h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
}

.feature-card p {
  margin: 0;
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-muted);
}

.feature-more {
  margin-top: 0.6rem;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--active);
}

/* 카드별 상단 포인트 색 (옅게) */
.feature-card.region {
  border-top-color: #86efac;
}

.feature-card.community {
  border-top-color: #5eead4;
}

.feature-card.map {
  border-top-color: #7dd3fc;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.weather-card,
.trending-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.weather-header,
.trending-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.weather-header h3,
.trending-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text);
}

.weather-badge,
.live-pill {
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  background: rgba(34, 197, 94, 0.12);
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.weather-icon {
  font-size: 2.3rem;
}

.weather-temp {
  font-size: 2.3rem;
  font-weight: 800;
  color: var(--accent);
}

.weather-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
}

.weather-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.ticker-viewport {
  overflow: hidden;
  height: 74px;
  border-radius: 12px;
  background: rgba(34, 197, 94, 0.08);
  padding: 0 0.5rem;
}

.ticker-track {
  display: flex;
  flex-direction: column;
  transition: transform 0.6s ease;
}

.ticker-slide {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  height: 74px;
  padding: 0 0.25rem;
}

.ticker-rank {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  flex-shrink: 0;
}

.ticker-body {
  min-width: 0;
}

.ticker-title {
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticker-meta {
  font-size: 0.84rem;
  color: var(--text-muted);
}

.empty-note {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.95rem;
}

/* 사진 박스: 이미지가 박스에 꽉 차도록 패딩 제거 */
.photo-box {
  padding: 0;
  overflow: hidden;
}

.hero-img {
  display: block;
  width: 100%;
  height: auto;
}

/* 좁은 화면: 카드 세로 정렬 */
@media (max-width: 820px) {
  .title-box h1 {
    font-size: 1.9rem;
  }

  .hero-cards {
    grid-template-columns: 1fr;
  }

  .insight-grid {
    grid-template-columns: 1fr;
  }

  .weather-meta {
    grid-template-columns: 1fr;
  }
}
</style>
