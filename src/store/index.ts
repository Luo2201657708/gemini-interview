import { defineStore } from 'pinia'
import questionBankRaw from '../../../output.json'

export interface Question {
  id: string
  question: string
  level: string
  answer: string
}

export interface CategoryData {
  category: string
  questions: Question[]
}

export const useAppStore = defineStore('app', {
  state: () => ({
    questionBank: questionBankRaw as CategoryData[],
    favorites: JSON.parse(localStorage.getItem('favorites') || '[]') as string[],
    mastered: JSON.parse(localStorage.getItem('mastered') || '[]') as string[],
    selectedCategory: null as string | null, // Categories view state tracking
  }),
  getters: {
    // Global search keywords
    searchQuestions: (state) => {
      return (keyword: string) => {
        if (!keyword.trim()) return []
        const lowerKeyword = keyword.toLowerCase()
        const results: { category: string; question: Question }[] = []
        state.questionBank.forEach((cat) => {
          cat.questions.forEach((q) => {
            const hasMatch = 
              q.question.toLowerCase().includes(lowerKeyword) ||
              q.answer.toLowerCase().includes(lowerKeyword)
            if (hasMatch) {
              results.push({
                category: cat.category,
                question: q,
              })
            }
          })
        })
        return results
      }
    },
    // Get all favorite questions
    favoriteQuestions: (state) => {
      const results: { category: string; question: Question }[] = []
      state.questionBank.forEach((cat) => {
        cat.questions.forEach((q) => {
          if (state.favorites.includes(q.id)) {
            results.push({
              category: cat.category,
              question: q,
            })
          }
        })
      })
      return results
    },
    // Helper check if question is favorite
    isFavorite: (state) => {
      return (questionId: string) => state.favorites.includes(questionId)
    },
    // Helper check if question is mastered
    isMastered: (state) => {
      return (questionId: string) => state.mastered.includes(questionId)
    },
    // Get master percentage overall
    overallProgress: (state) => {
      let total = 0
      state.questionBank.forEach((cat) => {
        total += cat.questions.length
      })
      const masteredCount = state.mastered.length
      const percent = total > 0 ? Math.round((masteredCount / total) * 100) : 0
      return {
        masteredCount,
        totalQuestions: total,
        percent,
      }
    },
    // Get category performance
    categoryProgress: (state) => {
      return (categoryName: string) => {
        const cat = state.questionBank.find((c) => c.category === categoryName)
        const questions = cat ? cat.questions : []
        const total = questions.length
        if (total === 0) return { masteredCount: 0, total: 0, percent: 0 }
        const mastered = questions.filter((q) => state.mastered.includes(q.id)).length
        const percent = Math.round((mastered / total) * 100)
        return { masteredCount: mastered, total, percent }
      }
    }
  },
  actions: {
    toggleFavorite(questionId: string) {
      const idx = this.favorites.indexOf(questionId)
      if (idx > -1) {
        this.favorites.splice(idx, 1)
      } else {
        this.favorites.push(questionId)
      }
      localStorage.setItem('favorites', JSON.stringify(this.favorites))
    },
    toggleMastered(questionId: string) {
      const idx = this.mastered.indexOf(questionId)
      if (idx > -1) {
        this.mastered.splice(idx, 1)
      } else {
        this.mastered.push(questionId)
      }
      localStorage.setItem('mastered', JSON.stringify(this.mastered))
    },
    setMasteredState(questionId: string, mastered: boolean) {
      const idx = this.mastered.indexOf(questionId)
      if (mastered && idx === -1) {
        this.mastered.push(questionId)
      } else if (!mastered && idx > -1) {
        this.mastered.splice(idx, 1)
      }
      localStorage.setItem('mastered', JSON.stringify(this.mastered))
    }
  }
})
