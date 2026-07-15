# 백엔드 작업 요청: 지도 핀 API(§2-2)에 `district` 필터 추가

> 대상: LocalHub 백엔드 (FastAPI)
> 관련 계약서: API_CONTRACT (v1.1) §2-2 지도 핀 데이터 조회
> 프론트는 이미 이 변경을 전제로 구현 완료 — 백엔드에 `district` 파라미터만 추가하면 지도 구(區) 필터가 동작합니다.

---

## 배경

- 지도(프론트)는 카테고리 필터 + **구(區) 필터** + 클러스터링을 제공한다.
- 지도 핀은 경량 엔드포인트 `GET /api/locations/map`(§2-2)에서 가져온다.
- 현재 §2-2는 `types`, `limit`만 지원하고 **`district` 파라미터가 없어** 구 필터가 서버에서 걸리지 않는다.
- 목록 API(§2-1)는 `size` 상한이 100이라 지도에 필요한 대량 핀을 받기 부적합 → 지도는 §2-2를 쓰는 것이 계약서 의도에 맞음.
- 따라서 §2-2에 `district` 필터 파라미터를 추가한다. (응답 필드 추가가 아니라 **쿼리 필터 조건만** 추가)

---

## 변경 사항

### 엔드포인트
```
GET /api/locations/map?types={comma_separated_types}&district={district}&limit={limit}
```

| 파라미터 | 필수 | 기본값 | 설명 |
|---|---|---|---|
| types | X | 전체 | 콤마 구분 contentTypeId (예: `12,38`) |
| **district** | **X (신규)** | **전체** | **구별 필터 (예: `종로구`). 미지정 시 전체 구** |
| limit | X | 500 | 핀 상한 |

### 서버 쿼리 조건
기존 조건에 district 필터만 AND로 추가:
```sql
WHERE mapx IS NOT NULL AND mapy IS NOT NULL
  [AND content_type_id IN (:types)]      -- types 지정 시
  [AND district = :district]             -- district 지정 시 (신규)
LIMIT :limit
```

### 응답 (변경 없음 — 기존 그대로)
```json
{
  "items": [
    { "id": 101, "content_type_id": "12", "title": "경복궁", "mapx": 126.9769, "mapy": 37.5788 }
  ],
  "total": 483
}
```
- 응답 필드는 그대로 유지한다 (`district`를 items에 넣지 않는다 — 필터만 서버에서 처리).

---

## FastAPI 구현 가이드 (예시)

```python
@router.get("/api/locations/map")
def get_map_pins(
    types: str | None = None,
    district: str | None = None,   # 신규
    limit: int = Query(500, le=500),
    db: Session = Depends(get_db),
):
    q = db.query(Location).filter(
        Location.mapx.isnot(None), Location.mapy.isnot(None)
    )
    if types:
        type_list = [t for t in types.split(",") if t]
        q = q.filter(Location.content_type_id.in_(type_list))
    if district:                    # 신규
        q = q.filter(Location.district == district)
    rows = q.limit(limit).all()
    return {
        "items": [
            {"id": r.id, "content_type_id": r.content_type_id,
             "title": r.title, "mapx": r.mapx, "mapy": r.mapy}
            for r in rows
        ],
        "total": len(rows),
    }
```

> `district` 컬럼은 v1.1에서 이미 추가된 파생 필드(주소 `addr1`에서 "○○구" 추출, 없으면 null). 별도 마이그레이션 불필요.

---

## 검증 (curl)

```bash
# 종로구 관광지만
curl "http://localhost:8000/api/locations/map?types=12&district=종로구&limit=500"
# → items 전부 종로구 항목이어야 함

# district 미지정 → 전체 (기존 동작 유지)
curl "http://localhost:8000/api/locations/map?types=12&limit=3"
```

- 구 목록 자체는 §2-5 `GET /api/locations/districts?type=`로 이미 제공 중 → 프론트 드롭다운은 그걸 사용. 이번 작업은 §2-2 필터만.

---

## 현재 상태 / 하위호환

- 지금 백엔드는 `district`를 **무시하고 200 반환**(전체 핀). → 프론트에서 구를 골라도 필터가 안 걸릴 뿐 에러는 없음(하위호환 OK).
- 백엔드에 위 필터를 추가하면 프론트 수정 없이 즉시 구 필터가 동작한다.

## 프론트 연동 지점 (참고)

- `src/api/locations.js` → `getMapPins({ types, district, limit })` 이미 `district` 전송 중.
- `src/pages/MapPage.vue` → 카테고리/구 선택 시 `getMapPins` 호출.

## 마무리 체크

- [ ] §2-2에 `district` 쿼리 파라미터 추가 (필터 조건만)
- [ ] 응답 형태 불변 확인
- [ ] curl로 구 필터 동작 확인
- [ ] **API_CONTRACT 문서 §2-2에 `district` 파라미터 반영** (구두 변경 금지 규칙)
