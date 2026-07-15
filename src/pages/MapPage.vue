<template>
  <section>
    <div class="card">
      <h1>지도</h1>
      <p>서울의 주요 관광지와 명소를 지도에서 확인하세요.</p>
    </div>
  </section>

  <section class="map-card">
    <div class="map-placeholder">
      <p>Leaflet 지도는 실제 프로젝트에서 OpenStreetMap 타일과 함께 구현됩니다.</p>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.map-card {
  min-height: 420px;
}

.map-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  min-height: 420px;
  color: #cbd5e1;
}
</style>
