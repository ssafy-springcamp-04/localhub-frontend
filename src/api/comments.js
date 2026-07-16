import axios from 'axios'

// 댓글 API. VITE_USE_MOCK=true 면 인메모리 목으로 동작.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

// ---- 목(mock) 저장소 ---------------------------------------------------
const db = [] // { id, post_id, content, password, created_at, updated_at }
let nextId = 1

function toPublic(c) {
  const { password, ...rest } = c
  return { ...rest }
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
function mockError(status, detail) {
  return { response: { status, data: { detail } } }
}

/**
 * 댓글 목록 조회
 * GET /api/posts/{postId}/comments
 * @returns {Promise<{items: Array, total: number}>}
 */
export async function getComments(postId) {
  if (USE_MOCK) {
    await delay(150)
    const items = db
      .filter((c) => String(c.post_id) === String(postId))
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map(toPublic)
    return { items, total: items.length }
  }
  const { data } = await axios.get(`${API_BASE}/api/posts/${postId}/comments`)
  return data
}

/**
 * 댓글 작성
 * POST /api/posts/{postId}/comments
 */
export async function createComment(postId, { content, password }) {
  if (USE_MOCK) {
    await delay(200)
    const now = new Date().toISOString().slice(0, 19)
    const c = {
      id: nextId++,
      post_id: Number(postId),
      content,
      password,
      created_at: now,
      updated_at: null
    }
    db.push(c)
    return toPublic(c)
  }
  const { data } = await axios.post(`${API_BASE}/api/posts/${postId}/comments`, {
    content,
    password
  })
  return data
}

/**
 * 댓글 비밀번호 확인 (수정 진입)
 * POST /api/comments/{commentId}/verify
 */
export async function verifyCommentPassword(commentId, password) {
  if (USE_MOCK) {
    await delay(120)
    const c = db.find((x) => x.id === Number(commentId))
    if (!c) throw mockError(404, '댓글을 찾을 수 없습니다.')
    if (c.password !== password) throw mockError(403, '비밀번호가 일치하지 않습니다.')
    return { verified: true }
  }
  const { data } = await axios.post(`${API_BASE}/api/comments/${commentId}/verify`, { password })
  return data
}

/**
 * 댓글 수정
 * PUT /api/comments/{commentId}
 */
export async function updateComment(commentId, { password, content }) {
  if (USE_MOCK) {
    await delay(200)
    const c = db.find((x) => x.id === Number(commentId))
    if (!c) throw mockError(404, '댓글을 찾을 수 없습니다.')
    if (c.password !== password) throw mockError(403, '비밀번호가 일치하지 않습니다.')
    c.content = content
    c.updated_at = new Date().toISOString().slice(0, 19)
    return toPublic(c)
  }
  const { data } = await axios.put(`${API_BASE}/api/comments/${commentId}`, { password, content })
  return data
}

/**
 * 댓글 삭제
 * DELETE /api/comments/{commentId}  (본문에 password)
 */
export async function deleteComment(commentId, password) {
  if (USE_MOCK) {
    await delay(200)
    const idx = db.findIndex((x) => x.id === Number(commentId))
    if (idx === -1) throw mockError(404, '댓글을 찾을 수 없습니다.')
    if (db[idx].password !== password) throw mockError(403, '비밀번호가 일치하지 않습니다.')
    db.splice(idx, 1)
    return
  }
  await axios.delete(`${API_BASE}/api/comments/${commentId}`, { data: { password } })
}
