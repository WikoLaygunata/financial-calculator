import { createRouter, createWebHistory } from 'vue-router'
import { MODULES, getStage } from '@/data/modules'

/**
 * Semua view kalkulator di-lazy load agar halaman pertama (dashboard) ringan.
 * Vite otomatis memecahnya menjadi chunk terpisah.
 */
const VIEWS = {
  'dana-darurat': () => import('@/views/EmergencyFundView.vue'),
  anggaran: () => import('@/views/BudgetView.vue'),
  'kesehatan-cicilan': () => import('@/views/DebtRatioView.vue'),
  'bebas-utang': () => import('@/views/DebtFreeView.vue'),
  'simulasi-pinjaman': () => import('@/views/LoanView.vue'),
  'target-impian': () => import('@/views/GoalView.vue'),
  pensiun: () => import('@/views/RetirementView.vue'),
  'passive-income': () => import('@/views/PassiveIncomeView.vue'),
  inflasi: () => import('@/views/InflationView.vue'),
  dca: () => import('@/views/DcaView.vue'),
  'bandingkan-aset': () => import('@/views/CompareAssetsView.vue'),
  rebalancing: () => import('@/views/RebalanceView.vue'),
  kamus: () => import('@/views/GlossaryView.vue'),
}

const moduleRoutes = MODULES.map((m) => ({
  path: m.path,
  name: m.id,
  component: VIEWS[m.id],
  meta: {
    title: m.title,
    stage: getStage(m.stage)?.label ?? '',
  },
}))

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { title: 'Dashboard Kesehatan Finansial' },
    },
    ...moduleRoutes,
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Halaman Tidak Ditemukan' },
    },
  ],
  scrollBehavior: (to, from, savedPosition) => savedPosition ?? { top: 0 },
})

router.afterEach((to) => {
  const title = to.meta?.title
  document.title = title ? `${title} · Financi` : 'Financi'
})

export default router
