import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import CategoriesPage from './pages/CategoriesPage.vue'
import MapPage from './pages/MapPage.vue'
import PlaceList from './views/PlaceList.vue'
import PostListPage from './views/community/PostListPage.vue'
import PostDetailPage from './views/community/PostDetailPage.vue'
import PostFormPage from './views/community/PostFormPage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/categories', component: CategoriesPage },
  { path: '/places/:type', component: PlaceList },
  { path: '/community', name: 'community-list', component: PostListPage },
  { path: '/community/new', name: 'community-new', component: PostFormPage },
  { path: '/community/:id(\\d+)', name: 'community-detail', component: PostDetailPage },
  { path: '/community/:id(\\d+)/edit', name: 'community-edit', component: PostFormPage },
  { path: '/map', component: MapPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
