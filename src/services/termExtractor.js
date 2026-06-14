import { postJson } from './apiClient.js'

const MAX_INPUT_LENGTH = 12000

export async function extractTerms(text) {
  const cleanText = typeof text === 'string' ? text.trim() : ''

  if (!cleanText) {
    throw new Error('请输入英文技术文本。')
  }
  if (cleanText.length > MAX_INPUT_LENGTH) {
    throw new Error(`文本不能超过 ${MAX_INPUT_LENGTH.toLocaleString()} 个字符。`)
  }

  const data = await postJson('/api/extract-terms', { text: cleanText })

  if (!data || !Array.isArray(data.terms)) {
    throw new Error('术语提取结果格式不正确。')
  }

  const seen = new Set()
  const terms = data.terms
    .map((item) => ({
      term: typeof item?.term === 'string' ? item.term.trim() : '',
      context_sentence:
        typeof item?.context_sentence === 'string'
          ? item.context_sentence.trim()
          : '',
    }))
    .filter((item) => {
      const key = item.term.toLocaleLowerCase()
      if (!item.term || !item.context_sentence || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 8)

  if (terms.length === 0) {
    throw new Error('没有从这段文本中找到合适的技术术语。')
  }

  return terms
}
