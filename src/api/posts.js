import axios from 'axios'
import postsSeed from '../data/posts.json'

// API 계약서 §1 (posts) — VITE_USE_MOCK=true 면 인메모리 목으로 동작.
// 백엔드 완성 후 VITE_USE_MOCK=false + VITE_API_BASE_URL 교체만으로 전환.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

// ---- 목(mock) 저장소 ---------------------------------------------------
// 세션 동안 유지되는 인메모리 DB (새로고침 시 초기화 — MVP 허용 범위).
const db = postsSeed.map((p) => ({ ...p }))
let nextId = Math.max(0, ...db.map((p) => p.id)) + 1

// 계약서: 응답에는 password 를 절대 포함하지 않는다.
function toPublic(post) {
  const { password, ...rest } = post
  return { ...rest }
}

// 목록 응답에는 content, password 를 포함하지 않는다.
function toSummary(post) {
  const { password, content, ...rest } = post
  return { ...rest }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// axios 오류와 동일한 형태로 던져 UI 에서 통일 처리.
function mockError(status, detail) {
  return { response: { status, data: { detail } } }
}

// ---- API -------------------------------------------------------------

/**
 * 게시글 목록 조회 (계약서 §1-1)
 * GET /api/posts?category=&q=&page=&size=
 * @returns {Promise<{items: Array, total: number, page: number, size: number}>}
 */
export async function listPosts({ category = '', q = '', page = 1, size = 10 } = {}) {
  if (USE_MOCK) {
    await delay(200)
    let rows = [...db]
    if (category) rows = rows.filter((p) => p.category === category)
    if (q) {
      const keyword = q.toLowerCase()
      rows = rows.filter((p) => p.title.toLowerCase().includes(keyword))
    }
    // 정렬: created_at DESC 고정
    rows.sort((a, b) => b.created_at.localeCompare(a.created_at))
    const total = rows.length
    const start = (page - 1) * size
    return { items: rows.slice(start, start + size).map(toSummary), total, page, size }
  }

  const { data } = await axios.get(`${API_BASE}/api/posts`, {
    params: { category: category || undefined, q: q || undefined, page, size }
  })
  return data
}

/**
 * 게시글 상세 조회 — 서버에서 views+1 처리 후 반환 (계약서 §1-2)
 * GET /api/posts/{id}
 */
export async function getPost(id) {
  if (USE_MOCK) {
    await delay(150)
    const post = db.find((p) => p.id === Number(id))
    if (!post) throw mockError(404, '게시글을 찾을 수 없습니다.')
    post.views += 1
    return toPublic(post)
  }

  const { data } = await axios.get(`${API_BASE}/api/posts/${id}`)
  return data
}

/**
 * 게시글 작성 (계약서 §1-3)
 * POST /api/posts
 * @returns {Promise<Object>} 상세와 동일 형태 (password 제외)
 */
export async function createPost({ category, title, content, password }) {
  if (USE_MOCK) {
    await delay(200)
    const now = new Date().toISOString().slice(0, 19)
    const post = {
      id: nextId++,
      category,
      title,
      content,
      views: 0,
      password,
      created_at: now,
      updated_at: null
    }
    db.push(post)
    return toPublic(post)
  }

  const { data } = await axios.post(`${API_BASE}/api/posts`, {
    category,
    title,
    content,
    password
  })
  return data
}

/**
 * 비밀번호 확인 — 수정 진입 전 검증 (계약서 §1-4)
 * POST /api/posts/{id}/verify
 * @returns {Promise<{verified: true}>}
 */
export async function verifyPassword(id, password) {
  if (USE_MOCK) {
    await delay(150)
    const post = db.find((p) => p.id === Number(id))
    if (!post) throw mockError(404, '게시글을 찾을 수 없습니다.')
    if (post.password !== password) throw mockError(403, '비밀번호가 일치하지 않습니다.')
    return { verified: true }
  }

  const { data } = await axios.post(`${API_BASE}/api/posts/${id}/verify`, { password })
  return data
}

/**
 * 게시글 수정 (계약서 §1-5)
 * PUT /api/posts/{id}
 */
export async function updatePost(id, { password, category, title, content }) {
  if (USE_MOCK) {
    await delay(200)
    const post = db.find((p) => p.id === Number(id))
    if (!post) throw mockError(404, '게시글을 찾을 수 없습니다.')
    if (post.password !== password) throw mockError(403, '비밀번호가 일치하지 않습니다.')
    post.category = category
    post.title = title
    post.content = content
    post.updated_at = new Date().toISOString().slice(0, 19)
    return toPublic(post)
  }

  const { data } = await axios.put(`${API_BASE}/api/posts/${id}`, {
    password,
    category,
    title,
    content
  })
  return data
}

/**
 * 게시글 삭제 (계약서 §1-6)
 * DELETE /api/posts/{id}  (본문에 password)
 * @returns {Promise<void>}
 */
export async function deletePost(id, password) {
  if (USE_MOCK) {
    await delay(200)
    const idx = db.findIndex((p) => p.id === Number(id))
    if (idx === -1) throw mockError(404, '게시글을 찾을 수 없습니다.')
    if (db[idx].password !== password) throw mockError(403, '비밀번호가 일치하지 않습니다.')
    db.splice(idx, 1)
    return
  }

  await axios.delete(`${API_BASE}/api/posts/${id}`, { data: { password } })
}
