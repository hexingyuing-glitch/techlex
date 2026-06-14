const MOCK_DELAY_MS = 250

const MOCK_GLOSSARY = {
  'idempotent operation': {
    translation: '幂等操作',
    definition:
      'An operation that has the same intended effect when performed multiple times.',
    definitionZh: '一种无论执行一次还是多次，预期结果都保持相同的操作。',
    example:
      'The update endpoint is idempotent, so retrying it will not create duplicate records.',
    exampleZh: '该更新接口具有幂等性，因此重试不会创建重复记录。',
    context:
      'Used when discussing API retries, HTTP methods, and distributed systems.',
    contextZh: '常用于讨论 API 重试、HTTP 方法和分布式系统。',
  },
  'transient failure': {
    translation: '暂时性故障',
    definition:
      'A temporary error that may disappear when an operation is attempted again.',
    definitionZh: '一种暂时出现、再次尝试后可能消失的错误。',
    example:
      'The worker uses exponential backoff after a transient failure.',
    exampleZh: '工作进程在发生暂时性故障后使用指数退避策略重试。',
    context:
      'Used when designing retries and fault-tolerant network services.',
    contextZh: '常用于设计重试机制和具备容错能力的网络服务。',
  },
  'distributed systems': {
    translation: '分布式系统',
    definition:
      'Systems whose components run on multiple networked computers and coordinate through messages.',
    definitionZh: '由多台联网计算机上的组件组成，并通过消息相互协作的系统。',
    example:
      'Distributed systems must handle partial failures and network delays.',
    exampleZh: '分布式系统必须处理局部故障和网络延迟。',
    context: 'Used when discussing services that coordinate across machines.',
    contextZh: '常用于讨论跨多台机器协作的服务架构。',
  },
  'network timeouts': {
    translation: '网络超时',
    definition:
      'Failures raised when a network operation does not finish within an expected period.',
    definitionZh: '网络操作未在预期时间内完成时产生的失败。',
    example:
      'The client retries selected requests after network timeouts.',
    exampleZh: '客户端会在网络超时后重试部分请求。',
    context: 'Used when handling unreliable or slow network communication.',
    contextZh: '常用于处理不可靠或响应缓慢的网络通信。',
  },
  'exponential backoff': {
    translation: '指数退避',
    definition:
      'A retry strategy that increases the waiting time after each failed attempt.',
    definitionZh: '一种每次失败后逐步增加等待时间的重试策略。',
    example:
      'Exponential backoff prevents clients from overwhelming a busy service.',
    exampleZh: '指数退避可以避免客户端持续压垮繁忙的服务。',
    context: 'Used in retry, rate-limit, and congestion-control logic.',
    contextZh: '常用于重试、限流和拥塞控制逻辑。',
  },
  'eventual consistency': {
    translation: '最终一致性',
    definition:
      'A consistency model in which replicas converge after updates stop.',
    definitionZh: '一种在更新停止后，各副本最终会达到一致状态的一致性模型。',
    example:
      'The cache uses eventual consistency across regions.',
    exampleZh: '该缓存在不同区域之间采用最终一致性。',
    context: 'Used when discussing replicated data and distributed databases.',
    contextZh: '常用于讨论数据副本和分布式数据库。',
  },
  'backward compatibility': {
    translation: '向后兼容性',
    definition:
      'The ability of a new version to work with data or clients from an older version.',
    definitionZh: '新版本仍能与旧版本的数据或客户端正常协作的能力。',
    example:
      'The API keeps backward compatibility by preserving the original field.',
    exampleZh: '该 API 通过保留原字段来维持向后兼容性。',
    context: 'Used in API, schema, protocol, and release design.',
    contextZh: '常用于 API、数据结构、协议和版本发布设计。',
  },
  'race condition': {
    translation: '竞态条件',
    definition:
      'A bug whose outcome depends on the timing of concurrent operations.',
    definitionZh: '一种结果取决于多个并发操作执行时序的缺陷。',
    example:
      'A lock prevents the race condition when two workers update the same row.',
    exampleZh: '锁可以防止两个工作进程更新同一行时产生竞态条件。',
    context: 'Used when reasoning about concurrency and shared state.',
    contextZh: '常用于分析并发行为和共享状态。',
  },
  'dependency injection': {
    translation: '依赖注入',
    definition:
      'A design technique that supplies dependencies from outside a component.',
    definitionZh: '一种从组件外部提供其依赖对象的设计方式。',
    example:
      'Dependency injection makes the service easier to test.',
    exampleZh: '依赖注入让该服务更容易测试。',
    context: 'Used in modular application design and automated testing.',
    contextZh: '常用于模块化应用设计和自动化测试。',
  },
  'rate limiting': {
    translation: '请求限流',
    definition:
      'A mechanism that restricts how many requests are accepted in a period.',
    definitionZh: '一种限制单位时间内可接受请求数量的机制。',
    example:
      'Rate limiting protects the API from sudden traffic spikes.',
    exampleZh: '请求限流可以保护 API 免受突发流量冲击。',
    context: 'Used for API protection, fairness, and cost control.',
    contextZh: '常用于 API 防护、公平性控制和成本管理。',
  },
}

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'against', 'because', 'before', 'being', 'between',
  'could', 'during', 'every', 'first', 'found', 'from', 'have', 'into', 'more',
  'other', 'should', 'system', 'their', 'there', 'these', 'they', 'this',
  'through', 'using', 'when', 'where', 'which', 'while', 'with', 'would',
])

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function findContext(sentences, term) {
  const lowerTerm = term.toLocaleLowerCase()
  return (
    sentences.find((sentence) =>
      sentence.toLocaleLowerCase().includes(lowerTerm),
    ) || sentences[0]
  )
}

function extractMockTerms(text) {
  const sentences = splitSentences(text)
  const lowerText = text.toLocaleLowerCase()
  const candidates = []
  const seen = new Set()

  for (const term of Object.keys(MOCK_GLOSSARY)) {
    if (lowerText.includes(term)) {
      candidates.push({
        term,
        context_sentence: findContext(sentences, term),
      })
      seen.add(term)
    }
  }

  const wordMatches = text.match(/[A-Za-z][A-Za-z-]{4,}/g) || []
  const frequencies = new Map()
  for (const originalWord of wordMatches) {
    const word = originalWord.toLocaleLowerCase()
    if (STOP_WORDS.has(word) || seen.has(word)) continue
    frequencies.set(word, (frequencies.get(word) || 0) + 1)
  }

  const words = [...frequencies.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([word]) => word)

  const targetCount = Math.min(
    8,
    Math.max(
      Math.min(5, candidates.length + words.length),
      3 + Math.ceil(wordMatches.length / 40),
    ),
  )

  for (const word of words) {
    if (candidates.length >= targetCount) break
    candidates.push({
      term: word,
      context_sentence: findContext(sentences, word),
    })
  }

  return candidates.slice(0, 8)
}

function buildGenericMockCard(term, contextSentence) {
  return {
    translation: `技术表达：${term}`,
    definition: `A technical expression selected from the supplied text: ${term}.`,
    definitionZh: `这是从输入文本中动态选出的技术表达“${term}”。演示模式不提供精确词典释义。`,
    example: contextSentence,
    exampleZh: `原文语境：${contextSentence}`,
    context: 'Used in the technical context supplied by the learner.',
    contextZh: '用于学习者所提供的技术文本语境中。',
  }
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
    return { terms: extractMockTerms(body.text) }
  }

  const content =
    MOCK_GLOSSARY[body.term.toLocaleLowerCase()] ??
    buildGenericMockCard(body.term, body.context_sentence)

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
