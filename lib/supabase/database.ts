import { createClient } from './client'
import type { Card } from '@/components/cards/card-types'

export interface DatabaseCard {
  id: string
  user_id: string
  card_number: string
  nickname?: string
  network: string
  level: string
  color?: string
  annual_fee_waived: boolean
  annual_fee_condition?: string
  limit_amount: number
  expiry_date?: string
  cardholder_name?: string
  notes?: string
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface CreateCardData {
  card_number: string
  nickname?: string
  network: string
  level: string
  color?: string
  annual_fee_waived?: boolean
  annual_fee_condition?: string
  limit_amount: number
  expiry_date?: string
  cardholder_name?: string
  notes?: string
  is_favorite?: boolean
}

export interface UpdateCardData extends Partial<CreateCardData> {
  id: string
}

export class CardService {
  private supabase = createClient()

  // 获取用户的所有卡片
  async getUserCards(): Promise<Card[]> {
    const { data, error } = await this.supabase
      .from('user_cards')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user cards:', error)
      throw new Error(`获取卡片失败: ${error.message}`)
    }

    return this.mapDatabaseCardsToCards(data || [])
  }

  // 创建新卡片（必须带上 user_id 以满足 RLS 与 NOT NULL 约束）
  async createCard(cardData: CreateCardData): Promise<Card> {
    const { data: userData, error: userError } = await this.supabase.auth.getUser()
    if (userError) {
      throw new Error(`获取用户失败: ${userError.message}`)
    }
    const userId = userData.user?.id
    if (!userId) {
      throw new Error('未登录，无法创建卡片')
    }

    // 仅保留数字，避免违反长度约束
    const sanitizedCardNumber = (cardData.card_number || '').replace(/\D/g, '')
    // 规范化日期：空串传 null
    const normalizedExpiry = cardData.expiry_date && cardData.expiry_date !== '' ? cardData.expiry_date : null

    const insertPayload = [{
      user_id: userId,
      ...cardData,
      card_number: sanitizedCardNumber,
      expiry_date: normalizedExpiry,
    }]

    const { data, error } = await this.supabase
      .from('user_cards')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      console.error('Error creating card:', error)
      throw new Error(`创建卡片失败: ${error.message}`)
    }

    return this.mapDatabaseCardToCard(data)
  }

  // 更新卡片
  async updateCard(cardData: UpdateCardData): Promise<Card> {
    const { id, ...updateData } = cardData

    // 如果包含 card_number，先清洗为仅数字
    if (typeof updateData.card_number === 'string') {
      updateData.card_number = updateData.card_number.replace(/\D/g, '')
    }
    // 规范化日期：空串传 null
    if (updateData.expiry_date !== undefined) {
      // @ts-expect-error allow null
      updateData.expiry_date = updateData.expiry_date && updateData.expiry_date !== '' ? updateData.expiry_date : null
    }
    
    const { data, error } = await this.supabase
      .from('user_cards')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating card:', error)
      throw new Error(`更新卡片失败: ${error.message}`)
    }

    return this.mapDatabaseCardToCard(data)
  }

  // 删除卡片
  async deleteCard(cardId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_cards')
      .delete()
      .eq('id', cardId)

    if (error) {
      console.error('Error deleting card:', error)
      throw new Error(`删除卡片失败: ${error.message}`)
    }
  }

  // 切换卡片收藏状态
  async toggleFavorite(cardId: string): Promise<Card> {
    // 先获取当前状态
    const { data: currentCard, error: fetchError } = await this.supabase
      .from('user_cards')
      .select('is_favorite')
      .eq('id', cardId)
      .single()

    if (fetchError) {
      console.error('Error fetching card:', fetchError)
      throw new Error(`获取卡片失败: ${fetchError.message}`)
    }

    // 切换状态
    const { data, error } = await this.supabase
      .from('user_cards')
      .update({ is_favorite: !currentCard.is_favorite })
      .eq('id', cardId)
      .select()
      .single()

    if (error) {
      console.error('Error toggling favorite:', error)
      throw new Error(`切换收藏状态失败: ${error.message}`)
    }

    return this.mapDatabaseCardToCard(data)
  }

  // 搜索卡片
  async searchCards(query: string): Promise<Card[]> {
    const { data, error } = await this.supabase
      .from('user_cards')
      .select('*')
      .or(`card_number.ilike.%${query}%,nickname.ilike.%${query}%,network.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching cards:', error)
      throw new Error(`搜索卡片失败: ${error.message}`)
    }

    return this.mapDatabaseCardsToCards(data || [])
  }

  // 按条件筛选卡片
  async filterCards(filters: {
    network?: string
    level?: string
    minLimit?: number
    maxLimit?: number
    isFavorite?: boolean
  }): Promise<Card[]> {
    let query = this.supabase
      .from('user_cards')
      .select('*')

    if (filters.network && filters.network !== '全部') {
      query = query.eq('network', filters.network)
    }

    if (filters.level && filters.level !== '全部') {
      query = query.eq('level', filters.level)
    }

    if (filters.minLimit) {
      query = query.gte('limit_amount', filters.minLimit)
    }

    if (filters.maxLimit) {
      query = query.lte('limit_amount', filters.maxLimit)
    }

    if (filters.isFavorite !== undefined) {
      query = query.eq('is_favorite', filters.isFavorite)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error filtering cards:', error)
      throw new Error(`筛选卡片失败: ${error.message}`)
    }

    return this.mapDatabaseCardsToCards(data || [])
  }

  // 获取用户卡片统计信息
  async getUserCardStats(): Promise<{
    total_cards: number
    total_limit: number
    avg_limit: number
    max_limit: number
    min_limit: number
  }> {
    const { data, error } = await this.supabase
      .from('user_card_stats')
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('Error fetching card stats:', error)
      throw new Error(`获取统计信息失败: ${error.message}`)
    }

    return {
      total_cards: data?.total_cards || 0,
      total_limit: data?.total_limit || 0,
      avg_limit: Math.round(data?.avg_limit || 0),
      max_limit: data?.max_limit || 0,
      min_limit: data?.min_limit || 0
    }
  }

  // 数据映射：数据库格式 -> 前端格式
  private mapDatabaseCardToCard(dbCard: DatabaseCard): Card {
    return {
      id: dbCard.id,
      cardNumber: dbCard.card_number,
      nickname: dbCard.nickname || '',
      network: dbCard.network as any,
      level: dbCard.level as any,
      limit: dbCard.limit_amount,
      color: dbCard.color,
      annualFeeWaived: dbCard.annual_fee_waived,
      annualFeeCondition: dbCard.annual_fee_condition || undefined,
      expiryDate: dbCard.expiry_date || '',
      cardholderName: dbCard.cardholder_name || '',
      notes: dbCard.notes || '',
      isFavorite: dbCard.is_favorite,
      createdAt: dbCard.created_at,
      updatedAt: dbCard.updated_at
    } as any
  }

  // 数据映射：数据库格式数组 -> 前端格式数组
  private mapDatabaseCardsToCards(dbCards: DatabaseCard[]): Card[] {
    return dbCards.map(dbCard => this.mapDatabaseCardToCard(dbCard))
  }

  // 数据映射：前端格式 -> 数据库格式
  private mapCardToDatabaseCard(card: Card): Omit<DatabaseCard, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
    return {
      card_number: (card.cardNumber || '').replace(/\D/g, ''),
      nickname: card.nickname || undefined,
      network: card.network,
      level: card.level,
      color: (card as any).color,
      annual_fee_waived: (card as any).annualFeeWaived ?? true,
      annual_fee_condition: (card as any).annualFeeCondition || undefined,
      limit_amount: card.limit,
      expiry_date: (card as any).expiryDate || undefined,
      cardholder_name: (card as any).cardholderName || undefined,
      notes: (card as any).notes || undefined,
      is_favorite: (card as any).isFavorite || false
    } as any
  }
}

// 导出单例实例
export const cardService = new CardService()
