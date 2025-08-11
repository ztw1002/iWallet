"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { BankCard } from "./card-types"
import { defaultGradientByNetwork, formatCardNumberDisplay } from "./card-utils"

type Store = {
  cards: BankCard[]
  addCard: (input: Omit<BankCard, "id" | "createdAt" | "updatedAt" | "color"> & { color?: string }) => string
  updateCard: (id: string, patch: Partial<Omit<BankCard, "id" | "createdAt" | "updatedAt">>) => void
  deleteCard: (id: string) => void
  importCards: (cards: BankCard[]) => void
  clear: () => void
}

export const useCardStore = create<Store>()(
  persist(
    (set, get) => ({
      cards: [],
      addCard: (input) => {
        const id = crypto.randomUUID()
        const now = new Date().toISOString()
        const normalizedNumber = formatCardNumberDisplay(input.cardNumber)
        const color = input.color ?? defaultGradientByNetwork(input.network)
        const card: BankCard = {
          id,
          nickname: input.nickname?.trim() || undefined,
          cardNumber: normalizedNumber,
          network: input.network,
          level: input.level,
          limit: Math.max(0, Math.round(input.limit)),
          color,
          annualFeeWaived: input.annualFeeWaived,
          annualFeeCondition: input.annualFeeWaived ? undefined : (input.annualFeeCondition?.trim() || ""),
          createdAt: now,
          updatedAt: now,
        }
        set({ cards: [card, ...get().cards] })
        return id
      },
      updateCard: (id, patch) => {
        const now = new Date().toISOString()
        set({
          cards: get().cards.map((c) =>
            c.id === id
              ? {
                ...c,
                ...patch,
                cardNumber: patch.cardNumber ? formatCardNumberDisplay(patch.cardNumber) : c.cardNumber,
                limit: typeof patch.limit === "number" ? Math.max(0, Math.round(patch.limit)) : c.limit,
                color: patch.color ?? c.color,
                annualFeeWaived: typeof patch.annualFeeWaived === "boolean" ? patch.annualFeeWaived : c.annualFeeWaived,
                annualFeeCondition:
                  typeof patch.annualFeeWaived === "boolean"
                    ? patch.annualFeeWaived
                      ? undefined
                      : (patch.annualFeeCondition ?? c.annualFeeCondition ?? "")
                    : (patch.annualFeeCondition ?? c.annualFeeCondition),
                updatedAt: now,
              }
              : c,
          ),
        })
      },
      deleteCard: (id) => set({ cards: get().cards.filter((c) => c.id !== id) }),
      importCards: (cards) => {
        // naive merge by id; if id duplicate, keep imported newer updatedAt
        const map = new Map<string, BankCard>()
        for (const c of get().cards) map.set(c.id, c)
        for (const c of cards) {
          const existing = map.get(c.id)
          if (!existing) map.set(c.id, c)
          else {
            const newer = new Date(c.updatedAt).getTime() > new Date(existing.updatedAt).getTime() ? c : existing
            map.set(c.id, newer)
          }
        }
        set({
          cards: Array.from(map.values()).sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        })
      },
      clear: () => set({ cards: [] }),
    }),
    {
      name: "cards-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ cards: s.cards }),
    },
  ),
)
