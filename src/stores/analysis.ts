import { defineStore } from 'pinia'

import type { AnalysisResult } from '@/types/analyzer'

interface AnalysisState {
  history: AnalysisResult[]
  hydrated: boolean
}

const STORAGE_KEY =
  'offer-pilot-analysis-history'

function saveHistory(
  history: AnalysisResult[],
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history),
  )
}

export const useAnalysisStore = defineStore(
  'analysis',
  {
    state: (): AnalysisState => ({
      history: [],
      hydrated: false,
    }),

    getters: {
      currentResult(
        state,
      ): AnalysisResult | null {
        return state.history[0] ?? null
      },

      totalCount(state): number {
        return state.history.length
      },

      averageScore(state): number {
        if (state.history.length === 0) {
          return 0
        }

        const total = state.history.reduce(
          (sum, item) => sum + item.score,
          0,
        )

        return Math.round(
          total / state.history.length,
        )
      },
    },

    actions: {
      hydrate(): void {
        if (this.hydrated) {
          return
        }

        try {
          const savedData =
            localStorage.getItem(STORAGE_KEY)

          if (!savedData) {
            this.hydrated = true
            return
          }

          const parsedData = JSON.parse(
            savedData,
          ) as unknown

          if (Array.isArray(parsedData)) {
            this.history =
              parsedData as AnalysisResult[]
          }
        } catch (error) {
          console.error(
            '读取分析历史失败：',
            error,
          )

          this.history = []
        } finally {
          this.hydrated = true
        }
      },

      addResult(
        result: AnalysisResult,
      ): void {
        const filteredHistory =
          this.history.filter(
            (item) => item.id !== result.id,
          )

        this.history = [
          result,
          ...filteredHistory,
        ].slice(0, 20)

        saveHistory(this.history)
      },

      removeResult(id: string): void {
        this.history = this.history.filter(
          (item) => item.id !== id,
        )

        saveHistory(this.history)
      },

      clearHistory(): void {
        this.history = []
        localStorage.removeItem(STORAGE_KEY)
      },
    },
  },
)