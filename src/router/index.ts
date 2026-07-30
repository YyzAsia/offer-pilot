import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  scrollBehavior(
    to,
    _from,
    savedPosition,
  ) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

    return {
      top: 0,
    }
  },

  routes: [
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),

      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: {
            title: '数据总览',
          },
        },


        {
          path: 'insights',
          name: 'insights',

          component: () =>
            import(
              '@/views/InsightsView.vue'
            ),

          meta: {
            title: '数据洞察',
          },
        },

        {
          path: 'analyzer',
          name: 'analyzer',
          component: () => import('@/views/AnalyzerView.vue'),
          meta: {
            title: 'JD 智能分析',
          },
        },
        {
          path: 'roadmap',
          name: 'roadmap',
          component: () => import('@/views/RoadmapView.vue'),
          meta: {
            title: '学习路线',
          },
        },
        {
          path: 'applications',
          name: 'applications',
          component: () => import('@/views/ApplicationsView.vue'),
          meta: {
            title: '投递管理',
          },
        },
      ],
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : 'OfferPilot'

  document.title = `${title} - OfferPilot`
})

export default router