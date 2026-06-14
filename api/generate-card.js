import { requestDeepSeekJson } from '../server/deepseekClient.js'
import { buildGenerateCardMessages } from '../server/promptTemplates.js'
import { errorResponse, json, readJson } from './_response.js'

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return json(
        { error: { code: 'METHOD_NOT_ALLOWED', message: '只支持 POST 请求。' } },
        405,
      )
    }

    const body = await readJson(request)
    const term = isNonEmptyString(body?.term) ? body.term.trim() : ''
    const contextSentence = isNonEmptyString(body?.context_sentence)
      ? body.context_sentence.trim()
      : ''

    if (!term || !contextSentence) {
      return json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'term 和 context_sentence 不能为空。',
          },
        },
        400,
      )
    }

    try {
      const result = await requestDeepSeekJson(
        buildGenerateCardMessages(term, contextSentence),
        { maxTokens: 1000 },
      )

      if (
        !isNonEmptyString(result?.definition) ||
        !isNonEmptyString(result?.example) ||
        !isNonEmptyString(result?.context)
      ) {
        return json(
          {
            error: {
              code: 'INVALID_MODEL_OUTPUT',
              message: '模型返回的卡片字段不完整。',
            },
          },
          502,
        )
      }

      return json({
        term,
        definition: result.definition.trim(),
        example: result.example.trim(),
        context: result.context.trim(),
      })
    } catch (error) {
      return errorResponse(error)
    }
  },
}
