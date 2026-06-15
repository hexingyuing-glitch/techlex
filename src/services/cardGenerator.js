import { postJson } from './apiClient.js'

const FIELD_LIMITS = {
  translation: 200,
  definition: 600,
  definitionZh: 600,
  example: 600,
  exampleZh: 600,
  context: 600,
  contextZh: 600,
}

function cleanField(data, field) {
  const value = typeof data?.[field] === 'string' ? data[field].trim() : ''
  if (!value) {
    throw new Error(`卡片缺少 ${field} 字段。`)
  }
  return value.slice(0, FIELD_LIMITS[field])
}

export async function generateCard(term, contextSentence) {
  const cleanTerm = typeof term === 'string' ? term.trim() : ''
  const cleanSentence =
    typeof contextSentence === 'string' ? contextSentence.trim() : ''

  if (!cleanTerm || !cleanSentence) {
    throw new Error('术语和原文句子不能为空。')
  }

  const data = await postJson('/api/generate-card', {
    term: cleanTerm,
    context_sentence: cleanSentence,
  })

  return {
    id: crypto.randomUUID(),
    term: cleanTerm,
    translation: cleanField(data, 'translation'),
    definition: cleanField(data, 'definition'),
    definitionZh: cleanField(data, 'definitionZh'),
    example: cleanField(data, 'example'),
    exampleZh: cleanField(data, 'exampleZh'),
    context: cleanField(data, 'context'),
    contextZh: cleanField(data, 'contextZh'),
    sourceSentence: cleanSentence.slice(0, 1000),
    createdAt: new Date().toISOString(),
    reviewWeight: 1,
    wrongCount: 0,
    correctCount: 0,
    lastReviewedAt: null,
  }
}
