import { requestDeepSeekJson } from '../server/deepseekClient.js'
import { buildExtractTermsMessages } from '../server/promptTemplates.js'
import { errorResponse, json, readJson } from './_response.js'

const MAX_TEXT_LENGTH = 12000

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return json(
        { error: { code: 'METHOD_NOT_ALLOWED', message: '只支持 POST 请求。' } },
        405,
      )
    }

    const body = await readJson(request)
    const text = typeof body?.text === 'string' ? body.text.trim() : ''

    if (!text) {
      return json(
        { error: { code: 'INVALID_INPUT', message: 'text 不能为空。' } },
        400,
      )
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return json(
        {
          error: {
            code: 'TEXT_TOO_LONG',
            message: `text 不能超过 ${MAX_TEXT_LENGTH} 个字符。`,
          },
        },
        400,
      )
    }

    try {
      const result = await requestDeepSeekJson(
        buildExtractTermsMessages(text),
        { maxTokens: 1600 },
      )
      const terms = Array.isArray(result?.terms)
        ? result.terms
            .filter(
              (item) =>
                typeof item?.term === 'string' &&
                typeof item?.context_sentence === 'string',
            )
            .slice(0, 8)
        : []

      if (terms.length === 0) {
        return json(
          {
            error: {
              code: 'INVALID_MODEL_OUTPUT',
              message: '模型没有返回有效的术语列表。',
            },
          },
          502,
        )
      }

      return json({ terms })
    } catch (error) {
      return errorResponse(error)
    }
  },
}
