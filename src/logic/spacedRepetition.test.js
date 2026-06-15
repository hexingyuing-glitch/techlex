import { describe, expect, it } from 'vitest'
import {
  normalizeAnswer,
  selectWeightedCard,
  updateReviewStats,
} from './spacedRepetition.js'
import { sampleCard } from '../test/fixtures.js'

describe('spaced repetition', () => {
  it('normalizes answer case and spacing', () => {
    expect(normalizeAnswer('  Idempotent   Operation ')).toBe(
      'idempotent operation',
    )
  })

  it('increases weight and wrong count after an incorrect answer', () => {
    const updated = updateReviewStats(
      sampleCard,
      false,
      new Date('2026-06-14T10:00:00.000Z'),
    )
    expect(updated.wrongCount).toBe(1)
    expect(updated.reviewWeight).toBe(2)
    expect(updated.lastReviewedAt).toBe('2026-06-14T10:00:00.000Z')
  })

  it('never lowers weight below the minimum', () => {
    const updated = updateReviewStats(
      { ...sampleCard, reviewWeight: 0.25 },
      true,
    )
    expect(updated.reviewWeight).toBe(0.25)
    expect(updated.correctCount).toBe(1)
  })

  it('selects cards using deterministic weighted positions', () => {
    const cards = [
      { ...sampleCard, id: 'a', reviewWeight: 1 },
      { ...sampleCard, id: 'b', reviewWeight: 3 },
    ]
    expect(selectWeightedCard(cards, { random: () => 0.1 }).id).toBe('a')
    expect(selectWeightedCard(cards, { random: () => 0.9 }).id).toBe('b')
  })
})
