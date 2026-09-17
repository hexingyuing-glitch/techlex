import { describe, expect, it } from 'vitest'
import { generateSelected } from './generationQueue.js'

describe('generation worker pool', () => {
  it('bounds concurrency, reports early results and continues after failure', async () => {
    let active = 0,
      maximum = 0
    const pending = []
    const results = []
    const items = Array.from({ length: 5 }, (_, index) => ({
      term: String(index),
      context_sentence: 'context',
    }))
    const work = generateSelected(
      items,
      (term) => {
        active++
        maximum = Math.max(maximum, active)
        return new Promise((resolve, reject) =>
          pending.push(() => {
            active--
            if (term === '1') reject(new Error('temporary failure'))
            else resolve({ term })
          }),
        )
      },
      (item, result) => results.push({ term: item.term, ...result }),
    )
    expect(active).toBe(3)
    while (results.length < 5) {
      if (pending.length) pending.shift()()
      await Promise.resolve()
    }
    await work
    expect(maximum).toBe(3)
    expect(results.filter((result) => result.card)).toHaveLength(4)
    expect(results.find((result) => result.term === '1').error).toBe(
      'temporary failure',
    )
  })
})
