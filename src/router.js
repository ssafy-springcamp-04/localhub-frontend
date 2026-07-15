import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import CategoriesPage from './pages/CategoriesPage.vue'
import CommunityPage from './pages/CommunityPage.vue'
import MapPage from './pages/MapPage.vue'
import ChatbotPage from './pages/ChatbotPage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/categories', component: CategoriesPage },
  { path: '/community', component: CommunityPage },
  { path: '/map', component: MapPage },
  { path: '/chatbot', component: ChatbotPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
