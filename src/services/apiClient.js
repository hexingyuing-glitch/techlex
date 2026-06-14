const MOCK_DELAY_MS = 250

const MOCK_TERMS = [
  {
    term: 'idempotent operation',
    context_sentence:
      'An idempotent operation produces the same result when repeated.',
  },
  {
    term: 'transient failure',
    context_sentence:
      'Clients can retry a request after a transient failure.',
  },
]

const MOCK_CARDS = {
  'idempotent operation': {
    definition:
      'An operation that has the same intended effect when performed multiple times.',
    example:
      'The update endpoint is idempotent, so retrying it will not create duplicate records.',
    context:
      'Used when discussing API retries, HTTP methods, and distributed systems.',
  },
  'transient failure': {
    definition:
      'A temporary error that may disappear when an operation is attempted again.',
    example:
      'The worker uses exponential backoff after a transient failure.',
    context:
      'Used when designing retries and fault-tolerant network services.',
  },
}

export class ApiClientError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', status = 0) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.status = status
  }
}

function isMockMode() {
  return import.meta.env.VITE_USE_MOCK_API === 'true'
}

async function mockRequest(path, body) {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))

  if (path === '/api/extract-terms') {
    return { terms: MOCK_TERMS }
  }

  const fallback = {
    definition: `A technical expression used in the supplied context: ${body.term}.`,
    example: `The team used ${body.term} while describing the system behavior.`,
    context: 'Used in technical documentation and engineering discussions.',
  }
  const content = MOCK_CARDS[body.term] ?? fallback

  return { term: body.term, ...content }
}

export async function postJson(path, body, { timeout = 35000 } = {}) {
  if (isMockMode()) {
    return mockRequest(path, body)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    let data
    try {
      data = await response.json()
    } catch {
      throw new ApiClientError(
        '服务器返回了无法解析的内容。',
        'INVALID_RESPONSE',
        response.status,
      )
    }

    if (!response.ok) {
      const error = data?.error
      throw new ApiClientError(
        error?.message || '请求失败，请稍后重试。',
        error?.code || 'REQUEST_FAILED',
        response.status,
      )
    }

    return data
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiClientError('请求超时，请稍后重试。', 'TIMEOUT')
    }
    if (error instanceof ApiClientError) throw error
    throw new ApiClientError(
      '无法连接服务，请检查网络或启动完整开发服务器。',
      'NETWORK_ERROR',
    )
  } finally {
    clearTimeout(timer)
  }
}
