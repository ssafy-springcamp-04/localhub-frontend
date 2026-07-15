<template>
  <section>
    <div class="card">
      <h1>축제 캘린더</h1>
      <p>서울의 축제·공연·행사 일정을 달력에서 한눈에 확인하세요. 일정을 클릭하면 상세가 표시됩니다.</p>
      <p class="demo-note">※ 표시되는 행사일은 데모용 샘플 데이터입니다. (원본 목록 데이터에 행사일이 없어 서버에서 임시 생성)</p>
    </div>
  </section>

  <section class="card calendar-card">
    <div v-if="loading" class="cal-status">축제 일정을 불러오는 중…</div>
    <div v-else-if="error" class="cal-status error">
      축제 데이터를 불러오지 못했습니다. 백엔드 서버 상태를 확인해 주세요.
    </div>
    <FullCalendar v-else :options="calendarOptions" />
  </section>

  <section v-if="selected" class="card selected-card">
    <div class="selected-head">
      <h2>{{ selected.title }}</h2>
      <button class="close-btn" type="button" @click="selected = null">✕</button>
    </div>
    <p class="selected-date">
      🗓 {{ selected.startDate }}
      <span v-if="selected.lastDate !== selected.startDate"> ~ {{ selected.lastDate }}</span>
    </p>
    <p v-if="selected.addr" class="selected-addr">📍 {{ selected.addr }}</p>
    <img
      v-if="selected.image"
      :src="selected.image"
      :alt="selected.title"
      class="selected-img"
      @error="onImgError"
    />
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import koLocale from '@fullcalendar/core/locales/ko'
import { getFestivals } from '../api/locations.js'

// FullCalendar 의 end 는 배타적(마지막 날 다음날)이라 종료일 +1일로 변환
function exclusiveEnd(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`)
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

const loading = ref(true)
const error = ref(false)
const selected = ref(null)

const onEventClick = (info) => {
  const e = info.event
  selected.value = {
    title: e.title,
    startDate: e.extendedProps.startDate,
    lastDate: e.extendedProps.lastDate,
    addr: e.extendedProps.addr,
    image: e.extendedProps.image
  }
}

const calendarOptions = ref({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  locale: koLocale,
  headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
  height: 'auto',
  dayMaxEvents: 3,
  eventDisplay: 'block',
  displayEventTime: false,
  events: [],
  eventClick: onEventClick
})

const onImgError = (e) => {
  e.target.style.display = 'none'
}

onMounted(async () => {
  try {
    const festivals = await getFestivals()
    calendarOptions.value.events = festivals
      // 행사일이 있는 축제만 캘린더에 표시
      .filter((f) => f.event_start)
      .map((f) => ({
        id: String(f.id),
        title: f.title,
        start: f.event_start,
        end: exclusiveEnd(f.event_end || f.event_start),
        allDay: true,
        extendedProps: {
          addr: f.addr1,
          image: f.first_image,
          startDate: f.event_start,
          lastDate: f.event_end || f.event_start
        }
      }))
  } catch (err) {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.demo-note {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: var(--muted);
}

.calendar-card {
  padding: 1.25rem;
}

.cal-status {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-muted);
}

.cal-status.error {
  color: #f87171;
}

/* 선택된 일정 상세 카드 */
.selected-card {
  margin-top: 1.25rem;
}

.selected-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.selected-head h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text);
}

.close-btn {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.2rem;
}

.close-btn:hover {
  color: var(--text);
}

.selected-date {
  margin: 0.6rem 0 0;
  font-weight: 600;
  color: var(--active);
}

.selected-addr {
  margin: 0.35rem 0 0;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.selected-img {
  margin-top: 0.9rem;
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  border: 1px solid var(--border);
}

/* FullCalendar 를 앱 테마(라이트/다크)에 맞춰 조율 */
:deep(.fc) {
  --fc-border-color: var(--border);
  --fc-today-bg-color: var(--accent-soft);
  --fc-neutral-bg-color: var(--surface-strong);
  --fc-page-bg-color: transparent;
  --fc-event-bg-color: var(--accent);
  --fc-event-border-color: var(--accent);
  --fc-event-text-color: #ffffff;
  --fc-button-text-color: #ffffff;
  --fc-button-bg-color: var(--accent);
  --fc-button-border-color: var(--accent);
  --fc-button-hover-bg-color: var(--accent-strong);
  --fc-button-hover-border-color: var(--accent-strong);
  --fc-button-active-bg-color: var(--accent-strong);
  --fc-button-active-border-color: var(--accent-strong);
  color: var(--text);
}

:deep(.fc .fc-toolbar-title),
:deep(.fc .fc-col-header-cell-cushion),
:deep(.fc .fc-daygrid-day-number) {
  color: var(--text);
}

:deep(.fc a) {
  color: inherit;
  text-decoration: none;
}

:deep(.fc .fc-daygrid-event) {
  cursor: pointer;
  font-weight: 600;
}

:deep(.fc .fc-day-other .fc-daygrid-day-number) {
  color: var(--muted);
}
</style>
