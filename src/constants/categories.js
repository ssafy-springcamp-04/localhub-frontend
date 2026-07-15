// API 계약서 §4 — posts.category 와 locations.content_type_id 가 공유하는 8종 코드.
// 이 파일이 유일한 정의처. 전원 여기서 import 한다. (임의 추가/변경 금지)
export const CATEGORIES = [
  { code: '12', label: '관광지' },
  { code: '14', label: '문화시설' },
  { code: '15', label: '축제공연행사' },
  { code: '25', label: '여행코스' },
  { code: '28', label: '레포츠' },
  { code: '32', label: '숙박' },
  { code: '38', label: '쇼핑' }
]

export function getCategoryLabel(code) {
  return CATEGORIES.find((c) => c.code === code)?.label ?? '지역정보'
}
