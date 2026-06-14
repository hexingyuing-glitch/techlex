const DEFAULT_BASE_URL = 'https://api.deepseek.com'
const DEFAULT_MODEL = 'deepseek-v4-flash'
const DEFAULT_TIMEOUT = 30000

const STATUS_ERRORS = {
  400: ['INVALID_REQUEST', 'DeepSeek 请求格式不正确。'],
  401: ['AUTHENTICATION_FAILED', 'DeepSeek API Key 无效。'],
  402: ['INSUFFICIENT_BALANCE', 'DeepSeek 账户余额不足。'],
  422: ['INVALID_PARAMETERS', 'DeepSeek 请求参数无效。'],
  429: ['RATE_LIMITED', '请求过于频繁，请稍后重试。'],
  500: ['PROVIDER_ERROR', 'DeepSeek 服务暂时出错。'],
  503: ['PROVIDER_OVERLOADED', 'DeepSeek 服务繁忙，请稍后重试。'],
}

export class DeepSeekError extends Error {
  constructor(message, code, status = 500, cause) {
    super(message, { cause })
    this.name = 'DeepSeekError'
    this.code = code
    this.status = status
  }
}

function parseJsonContent(content) {
  if (typeof content !== 'string' || !content.trim()) {
    throw new DeepSeekError(
      'DeepSeek 返回了空内容。',
      'EMPTY_PROVIDER_RESPONSE',
      502,
    )
  }

  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')

  try {
    return JSON.parse(cleaned)
  } catch (error) {
    throw new DeepSeekError(
      'DeepSeek 返回的 JSON 无法解析。',
      'INVALID_PROVIDER_JSON',
      502,
      error,
    )
  }
}

export async function requestDeepSeekJson(
  messages,
  {
    fetchImpl = fetch,
    env = process.env,
    timeout = DEFAULT_TIMEOUT,
    maxTokens = 1800,
  } = {},
) {
  const apiKey = env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new DeepSeekError(
      '服务端尚未配置 DEEPSEEK_API_KEY。',
      'MISSING_API_KEY',
      503,
    )
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetchImpl(
      `${env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: env.DEEPSEEK_MODEL || DEFAULT_MODEL,
          messages,
          response_format: { type: 'json_object' },
          max_tokens: maxTokens,
          stream: false,
        }),
        signal: controller.signal,
      },
    )

    if (!response.ok) {
      const [code, message] = STATUS_ERRORS[response.status] || [
        'PROVIDER_REQUEST_FAILED',
        'DeepSeek 请求失败。',
      ]
      throw new DeepSeekError(message, code, response.status)
    }

    let payload
    try {
      payload = await response.json()
    } catch (error) {
      throw new DeepSeekError(
        'DeepSeek 响应不是合法 JSON。',
        'INVALID_PROVIDER_RESPONSE',
        502,
        error,
      )
    }

    return parseJsonContent(payload?.choices?.[0]?.message?.content)
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new DeepSeekError(
        'DeepSeek 请求超时。',
        'PROVIDER_TIMEOUT',
        504,
        error,
      )
    }
    if (error instanceof DeepSeekError) throw error
    throw new DeepSeekError(
      '无法连接 DeepSeek 服务。',
      'PROVIDER_NETWORK_ERROR',
      502,
      error,
    )
  } finally {
    clearTimeout(timer)
  }
}
