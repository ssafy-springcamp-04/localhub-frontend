<template>
  <section>
    <div class="card">
      <h1>데이터 대시보드</h1>
      <p>서울 익스플로러의 지역정보·커뮤니티·축제 데이터를 한눈에 살펴보세요.</p>
    </div>
  </section>

  <p v-if="loading" class="state-msg">불러오는 중…</p>
  <p v-else-if="error" class="state-msg error">통계를 불러오지 못했습니다. 백엔드 서버 상태를 확인해 주세요.</p>

  <template v-else>
    <!-- KPI 타일 -->
    <section class="kpi-grid">
      <div class="card kpi">
        <span class="kpi-label">지역정보</span>
        <strong class="kpi-value">{{ fmt(stats.totals.locations) }}</strong>
      </div>
      <div class="card kpi">
        <span class="kpi-label">커뮤니티 게시글</span>
        <strong class="kpi-value">{{ fmt(stats.totals.posts) }}</strong>
      </div>
      <div class="card kpi">
        <span class="kpi-label">축제·행사</span>
        <strong class="kpi-value">{{ fmt(stats.totals.festivals) }}</strong>
      </div>
      <div class="card kpi">
        <span class="kpi-label">총 추천수</span>
        <strong class="kpi-value">{{ fmt(stats.totals.likes_sum) }}</strong>
      </div>
    </section>

    <!-- 차트 -->
    <section class="chart-grid">
      <div class="card chart-card">
        <h2>카테고리별 장소 수</h2>
        <div class="chart-box"><canvas ref="catCanvas"></canvas></div>
      </div>

      <div class="card chart-card">
        <h2>구별 장소 분포 (Top 10)</h2>
        <div class="chart-box"><canvas ref="distCanvas"></canvas></div>
      </div>

      <div class="card chart-card">
        <h2>추천 Top 10 장소</h2>
        <div class="chart-box"><canvas ref="likedCanvas"></canvas></div>
      </div>

      <div class="card chart-card">
        <h2>커뮤니티 카테고리별 게시글</h2>
        <div v-if="!stats.posts_by_category.length" class="empty-note">게시글 데이터가 없습니다.</div>
        <div v-else class="chart-box"><canvas ref="postCanvas"></canvas></div>
      </div>

      <div class="card chart-card wide">
        <h2>월별 축제·행사 건수</h2>
        <div v-if="!stats.festivals_by_month.length" class="empty-note">축제 일정 데이터가 없습니다.</div>
        <div v-else class="chart-box"><canvas ref="festCanvas"></canvas></div>
      </div>
    </section>
  </template>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { getStats } from '../api/stats.js'
import { isDarkTheme } from '../theme.js'

Chart.register(...registerables)

const PALETTE = [
  '#22c55e', '#16a34a', '#10b981', '#0d9488', '#14b8a6',
  '#0ea5e9', '#38bdf8', '#4ade80', '#5eead4', '#86efac'
]

const loading = ref(true)
const error = ref(false)
const stats = ref(null)

const catCanvas = ref(null)
const distCanvas = ref(null)
const likedCanvas = ref(null)
const postCanvas = ref(null)
const festCanvas = ref(null)

let charts = []

const fmt = (n) => (n ?? 0).toLocaleString('ko-KR')
const trim = (s, n = 14) => (s.length > n ? s.slice(0, n) + '…' : s)

// 테마에 따른 축/범례 색상
function themeColors() {
  const dark = isDarkTheme.value
  return {
    text: dark ? '#eaf1ed' : '#14291c',
    grid: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  }
}

function destroyCharts() {
  charts.forEach((c) => c.destroy())
  charts = []
}

function makeBar(canvas, labels, data, { horizontal = false, multicolor = false } = {}) {
  if (!canvas) return
  const { text, grid } = themeColors()
  const colors = multicolor ? labels.map((_, i) => PALETTE[i % PALETTE.length]) : '#22c55e'
  const chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderRadius: 6, maxBarThickness: 46 }]
    },
    options: {
      indexAxis: horizontal ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: text }, grid: { color: grid } },
        y: { ticks: { color: text }, grid: { color: grid } }
      }
    }
  })
  charts.push(chart)
}

function makeDoughnut(canvas, labels, data) {
  if (!canvas) return
  const { text } = themeColors()
  const chart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]), borderWidth: 0 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { color: text } } }
    }
  })
  charts.push(chart)
}

async function renderAll() {
  destroyCharts()
  await nextTick()
  const s = stats.value
  if (!s) return

  makeBar(
    catCanvas.value,
    s.locations_by_category.map((x) => x.label),
    s.locations_by_category.map((x) => x.count),
    { multicolor: true }
  )
  makeBar(
    distCanvas.value,
    s.locations_by_district.map((x) => x.district),
    s.locations_by_district.map((x) => x.count),
    { horizontal: true, multicolor: true }
  )
  makeBar(
    likedCanvas.value,
    s.top_liked.map((x) => trim(x.title)),
    s.top_liked.map((x) => x.likes),
    { horizontal: true, multicolor: true }
  )
  if (s.posts_by_category.length) {
    makeDoughnut(
      postCanvas.value,
      s.posts_by_category.map((x) => x.label),
      s.posts_by_category.map((x) => x.count)
    )
  }
  if (s.festivals_by_month.length) {
    makeBar(
      festCanvas.value,
      s.festivals_by_month.map((x) => x.month),
      s.festivals_by_month.map((x) => x.count)
    )
  }
}

onMounted(async () => {
  try {
    stats.value = await getStats()
    await renderAll()
  } catch (err) {
    error.value = true
  } finally {
    loading.value = false
  }
})

// 테마 전환 시 차트 색 갱신
watch(isDarkTheme, () => {
  if (stats.value) renderAll()
})

onBeforeUnmount(destroyCharts)
</script>

<style scoped>
.state-msg {
  text-align: center;
  color: var(--text-muted);
  padding: 3rem 0;
  font-weight: 500;
}

.state-msg.error {
  color: #ef4444;
}

/* KPI 타일 */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.kpi {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.kpi-label {
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
}

.kpi-value {
  font-size: 1.9rem;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: -0.02em;
}

/* 차트 그리드 */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.chart-card h2 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
}

.chart-card.wide {
  grid-column: 1 / -1;
}

.chart-box {
  position: relative;
  height: 300px;
}

.empty-note {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  font-size: 0.9rem;
}

@media (max-width: 820px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
