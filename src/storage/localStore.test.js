import { beforeEach, describe, expect, it } from 'vitest'
import {
  STORAGE_KEY,
  StorageError,
  addCards,
  deleteCard,
  getCards,
  updateCard,
} from './localStore.js'
import { sampleCard } from '../test/fixtures.js'

describe('localStore', () => {
  beforeEach(() => localStorage.clear())

  it('returns an empty list when no cards were saved', () => {
    expect(getCards()).toEqual([])
  })

  it('refreshes bilingual content while preserving duplicate review state', () => {
    addCards([sampleCard])
    const cards = addCards([
      {
        ...sampleCard,
        id: 'other-id',
        definitionZh: '更新后的中文解释。',
        reviewWeight: 1,
      },
    ])
    expect(cards).toHaveLength(1)
    expect(cards[0].id).toBe(sampleCard.id)
    expect(cards[0].definitionZh).toBe('更新后的中文解释。')
  })

  it('updates and deletes a card', () => {
    addCards([sampleCard])
    expect(updateCard({ ...sampleCard, correctCount: 2 })[0].correctCount).toBe(2)
    expect(deleteCard(sampleCard.id)).toEqual([])
  })

  it('reports damaged JSON instead of crashing silently', () => {
    localStorage.setItem(STORAGE_KEY, '{broken')
    expect(() => getCards()).toThrow(StorageError)
  })
})
