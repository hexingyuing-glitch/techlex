import { describe, expect, it, vi } from 'vitest'
import { DeepSeekError, requestDeepSeekJson } from './deepseekClient.js'

const env = {
  DEEPSEEK_API_KEY: 'test-key',
  DEEPSEEK_BASE_URL: 'https://example.test',
  DEEPSEEK_MODEL: 'deepseek-v4-flash',
}

describe('requestDeepSeekJson', () => {
  it('parses model JSON output', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      Response.json({
        choices: [{ message: { content: '{"terms":[]}' } }],
      }),
    )
    await expect(
      requestDeepSeekJson([], { fetchImpl, env }),
    ).resolves.toEqual({ terms: [] })
  })

  it.each([
    [401, 'AUTHENTICATION_FAILED'],
    [402, 'INSUFFICIENT_BALANCE'],
    [429, 'RATE_LIMITED'],
    [500, 'PROVIDER_ERROR'],
    [503, 'PROVIDER_OVERLOADED'],
  ])('maps provider status %s to %s', async (status, code) => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response('{}', { status }),
    )
    await expect(
      requestDeepSeekJson([], { fetchImpl, env }),
    ).rejects.toMatchObject({ code, status })
  })

  it('rejects malformed model JSON', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      Response.json({
        choices: [{ message: { content: 'not-json' } }],
      }),
    )
    await expect(
      requestDeepSeekJson([], { fetchImpl, env }),
    ).rejects.toBeInstanceOf(DeepSeekError)
  })

  it('maps an aborted provider request to a timeout error', async () => {
    const fetchImpl = vi.fn((url, options) => {
      return new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'))
        })
      })
    })

    await expect(
      requestDeepSeekJson([], { fetchImpl, env, timeout: 1 }),
    ).rejects.toMatchObject({
      code: 'PROVIDER_TIMEOUT',
      status: 504,
    })
  })
})
