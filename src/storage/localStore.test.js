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

  it('adds cards and skips exact term/source duplicates', () => {
    addCards([sampleCard])
    const cards = addCards([{ ...sampleCard, id: 'other-id' }])
    expect(cards).toHaveLength(1)
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
