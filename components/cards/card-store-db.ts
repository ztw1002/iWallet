"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Card } from "./card-types"
import { cardService } from "@/lib/supabase/database"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

type Store = {
  cards: Card[]
  loading: boolean
  error: string | null
  
  // 基础操作
  addCard: (input: Omit<Card, "id" | "createdAt" | "updatedAt">) => Promise<string>
  updateCard: (id: string, patch: Partial<Omit<Card, "id" | "createdAt" | "updatedAt">>) => Promise<void>
  deleteCard: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  
  // 数据同步
  fetchCards: () => Promise<void>
  syncWithDatabase: () => Promise<void>
  
  // 搜索和筛选
  searchCards: (query: string) => Promise<Card[]>
  filterCards: (filters: {
    network?: string
    level?: string
    minLimit?: number
    maxLimit?: number
    isFavorite?: boolean
  }) => Promise<Card[]>
  
  // 导入导出
  importCards: (cards: Card[]) => Promise<void>
  exportCards: () => Card[]
  clear: () => Promise<void>
  
  // 统计信息
  stats: {
    total_cards: number
    total_limit: number
    avg_limit: number
    max_limit: number
    min_limit: number
  } | null
  fetchStats: () => Promise<void>
}

export const useCardStoreDB = create<Store>()(
  persist(
    (set, get) => ({
      cards: [],
      loading: false,
      error: null,
      stats: null,

      // 添加卡片
      addCard: async (input) => {
        try {
          set({ loading: true, error: null })
          
          const cardData = {
            card_number: input.cardNumber,
            nickname: input.nickname,
            network: input.network,
            level: input.level,
            color: (input as any).color,
            annual_fee_waived: (input as any).annualFeeWaived ?? true,
            annual_fee_condition: (input as any).annualFeeCondition || undefined,
            limit_amount: input.limit,
            expiry_date: input.expiryDate || undefined,
            cardholder_name: input.cardholderName,
            notes: input.notes,
            is_favorite: input.isFavorite || false
          }

          const newCard = await cardService.createCard(cardData)
          set(state => ({
            cards: [newCard, ...state.cards],
            loading: false
          }))
          
          return newCard.id
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '添加卡片失败'
          set({ error: errorMessage, loading: false })
          throw new Error(errorMessage)
        }
      },

      // 更新卡片
      updateCard: async (id, patch) => {
        try {
          set({ loading: true, error: null })
          
          const updateData: any = {}
          if (patch.cardNumber) updateData.card_number = patch.cardNumber
          if (patch.nickname !== undefined) updateData.nickname = patch.nickname
          if (patch.network) updateData.network = patch.network
          if (patch.level) updateData.level = patch.level
          if ((patch as any).color !== undefined) updateData.color = (patch as any).color
          if ((patch as any).annualFeeWaived !== undefined) updateData.annual_fee_waived = (patch as any).annualFeeWaived
          if ((patch as any).annualFeeCondition !== undefined) updateData.annual_fee_condition = (patch as any).annualFeeCondition
          if (patch.limit !== undefined) updateData.limit_amount = patch.limit
          if (patch.expiryDate !== undefined) updateData.expiry_date = patch.expiryDate
          if (patch.cardholderName !== undefined) updateData.cardholder_name = patch.cardholderName
          if (patch.notes !== undefined) updateData.notes = patch.notes
          if (patch.isFavorite !== undefined) updateData.is_favorite = patch.isFavorite

          const updatedCard = await cardService.updateCard({ id, ...updateData })
          
          set(state => ({
            cards: state.cards.map(c => c.id === id ? updatedCard : c),
            loading: false
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '更新卡片失败'
          set({ error: errorMessage, loading: false })
          throw new Error(errorMessage)
        }
      },

      // 删除卡片
      deleteCard: async (id) => {
        try {
          set({ loading: true, error: null })
          
          await cardService.deleteCard(id)
          
          set(state => ({
            cards: state.cards.filter(c => c.id !== id),
            loading: false
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '删除卡片失败'
          set({ error: errorMessage, loading: false })
          throw new Error(errorMessage)
        }
      },

      // 切换收藏状态
      toggleFavorite: async (id) => {
        try {
          set({ loading: true, error: null })
          
          const updatedCard = await cardService.toggleFavorite(id)
          
          set(state => ({
            cards: state.cards.map(c => c.id === id ? updatedCard : c),
            loading: false
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '切换收藏状态失败'
          set({ error: errorMessage, loading: false })
          throw new Error(errorMessage)
        }
      },

      // 从数据库获取卡片
      fetchCards: async () => {
        try {
          set({ loading: true, error: null })
          
          const cards = await cardService.getUserCards()
          
          set({ cards, loading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '获取卡片失败'
          set({ error: errorMessage, loading: false })
          console.error('Error fetching cards:', error)
        }
      },

      // 与数据库同步
      syncWithDatabase: async () => {
        try {
          set({ loading: true, error: null })
          
          await get().fetchCards()
          await get().fetchStats()
          
          set({ loading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '同步数据失败'
          set({ error: errorMessage, loading: false })
          console.error('Error syncing with database:', error)
        }
      },

      // 搜索卡片
      searchCards: async (query) => {
        try {
          if (!query.trim()) {
            return get().cards
          }
          
          const results = await cardService.searchCards(query)
          return results
        } catch (error) {
          console.error('Error searching cards:', error)
          // 如果搜索失败，返回本地搜索结果
          const queryLower = query.toLowerCase()
          return get().cards.filter(card => 
            card.cardNumber.toLowerCase().includes(queryLower) ||
            card.nickname.toLowerCase().includes(queryLower) ||
            card.network.toLowerCase().includes(queryLower)
          )
        }
      },

      // 筛选卡片
      filterCards: async (filters) => {
        try {
          const results = await cardService.filterCards(filters)
          return results
        } catch (error) {
          console.error('Error filtering cards:', error)
          // 如果筛选失败，返回本地筛选结果
          let filtered = get().cards
          
          if (filters.network && filters.network !== '全部') {
            filtered = filtered.filter(card => card.network === filters.network)
          }
          
          if (filters.level && filters.level !== '全部') {
            filtered = filtered.filter(card => card.level === filters.level)
          }
          
          if (filters.minLimit) {
            filtered = filtered.filter(card => card.limit >= filters.minLimit!)
          }
          
          if (filters.maxLimit) {
            filtered = filtered.filter(card => card.limit <= filters.maxLimit!)
          }
          
          if (filters.isFavorite !== undefined) {
            filtered = filtered.filter(card => card.isFavorite === filters.isFavorite)
          }
          
          return filtered
        }
      },

      // 导入卡片
      importCards: async (cards) => {
        try {
          set({ loading: true, error: null })
          
          // 批量创建卡片
          const createdCards = []
          for (const card of cards) {
            try {
              const cardData = {
                card_number: card.cardNumber,
                nickname: card.nickname,
                network: card.network,
                level: card.level,
                color: (card as any).color,
                annual_fee_waived: (card as any).annualFeeWaived ?? true,
                annual_fee_condition: (card as any).annualFeeCondition || undefined,
                limit_amount: card.limit,
                expiry_date: card.expiryDate || undefined,
                cardholder_name: card.cardholderName,
                notes: card.notes,
                is_favorite: card.isFavorite || false
              }
              
              const newCard = await cardService.createCard(cardData)
              createdCards.push(newCard)
            } catch (error) {
              console.error(`Error importing card ${card.cardNumber}:`, error)
            }
          }
          
          // 更新本地状态
          set(state => ({
            cards: [...createdCards, ...state.cards],
            loading: false
          }))
          
          // 刷新统计信息
          await get().fetchStats()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '导入卡片失败'
          set({ error: errorMessage, loading: false })
          throw new Error(errorMessage)
        }
      },

      // 导出卡片
      exportCards: () => {
        return get().cards
      },

      // 清空卡片
      clear: async () => {
        try {
          set({ loading: true, error: null })
          
          // 从数据库删除所有卡片
          const cards = get().cards
          for (const card of cards) {
            try {
              await cardService.deleteCard(card.id)
            } catch (error) {
              console.error(`Error deleting card ${card.id}:`, error)
            }
          }
          
          set({ cards: [], stats: null, loading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '清空卡片失败'
          set({ error: errorMessage, loading: false })
          throw new Error(errorMessage)
        }
      },

      // 获取统计信息
      fetchStats: async () => {
        try {
          const stats = await cardService.getUserCardStats()
          set({ stats })
        } catch (error) {
          console.error('Error fetching stats:', error)
          // 如果获取统计失败，计算本地统计
          const cards = get().cards
          const total_limit = cards.reduce((sum, card) => sum + card.limit, 0)
          const avg_limit = cards.length > 0 ? Math.round(total_limit / cards.length) : 0
          const max_limit = cards.length > 0 ? Math.max(...cards.map(c => c.limit)) : 0
          const min_limit = cards.length > 0 ? Math.min(...cards.map(c => c.limit)) : 0
          
          set({
            stats: {
              total_cards: cards.length,
              total_limit,
              avg_limit,
              max_limit,
              min_limit
            }
          })
        }
      }
    }),
    {
      name: "cards-db-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ 
        cards: s.cards,
        stats: s.stats
      }),
    },
  ),
)
