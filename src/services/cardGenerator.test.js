import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateCard } from './cardGenerator.js'
import { postJson } from './apiClient.js'
import { sampleCard } from '../test/fixtures.js'

vi.mock('./apiClient.js', () => ({ postJson: vi.fn() }))
afterEach(() => vi.unstubAllEnvs())

describe('card provenance', () => {
  it('preserves demo and placeholder provenance in local mode', async () => {
    vi.stubEnv('VITE_USE_MOCK_API', 'true')
    postJson.mockResolvedValue({ ...sampleCard, contentSource: 'placeholder' })
    expect((await generateCard(sampleCard.term, sampleCard.sourceSentence)).contentSource).toBe('placeholder')
    postJson.mockResolvedValue({ ...sampleCard, contentSource: 'demo' })
    expect((await generateCard(sampleCard.term, sampleCard.sourceSentence)).contentSource).toBe('demo')
  })
  it('labels valid real-mode responses and rejects incomplete content', async () => {
    vi.stubEnv('VITE_USE_MOCK_API', 'false')
    postJson.mockResolvedValue(sampleCard)
    expect((await generateCard(sampleCard.term, sampleCard.sourceSentence)).contentSource).toBe('ai')
    postJson.mockResolvedValue({ ...sampleCard, definition: '' })
    await expect(generateCard(sampleCard.term, sampleCard.sourceSentence)).rejects.toThrow('definition')
  })
})
