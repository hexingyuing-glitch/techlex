import { afterEach, describe, expect, it, vi } from 'vitest'
import { postJson } from './apiClient.js'

describe('dynamic mock API', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('extracts more than two terms from a sufficiently rich input', async () => {
    vi.stubEnv('VITE_USE_MOCK_API', 'true')
    const text = `
      An idempotent operation helps clients recover from a transient failure.
      Distributed systems use exponential backoff after network timeouts.
      Eventual consistency, backward compatibility, dependency injection,
      race condition handling, and rate limiting are important engineering concepts.
    `

    const result = await postJson('/api/extract-terms', { text })

    expect(result.terms.length).toBeGreaterThan(2)
    expect(result.terms.length).toBeLessThanOrEqual(8)
  })

  it('returns bilingual content for known technical expressions', async () => {
    vi.stubEnv('VITE_USE_MOCK_API', 'true')

    const card = await postJson('/api/generate-card', {
      term: 'distributed systems',
      context_sentence: 'Distributed systems coordinate across machines.',
    })

    expect(card.translation).toBe('分布式系统')
    expect(card.definitionZh).toContain('多台联网计算机')
    expect(card.exampleZh).toBeTruthy()
    expect(card.contextZh).toBeTruthy()
  })
})
