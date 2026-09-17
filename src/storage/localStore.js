export const STORAGE_KEY = 'techlex.cards.v1'

export class StorageError extends Error {
  constructor(message, cause) {
    super(message, { cause })
    this.name = 'StorageError'
  }
}

function resolveStorage(storage) {
  if (storage) return storage
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  throw new StorageError('当前环境不支持浏览器本地存储。')
}

function cardKey(card) {
  return `${String(card.term).trim().toLocaleLowerCase()}::${String(
    card.sourceSentence ?? '',
  )
    .trim()
    .toLocaleLowerCase()}`
}

export function getCards(storage) {
  const target = resolveStorage(storage)

  try {
    const raw = target.getItem(STORAGE_KEY)
    if (!raw) return []
    const cards = JSON.parse(raw)
    if (!Array.isArray(cards)) {
      throw new TypeError('Stored cards must be an array.')
    }
    if (
      cards.some(
        (card) =>
          !card ||
          typeof card.id !== 'string' ||
          typeof card.term !== 'string' ||
          !card.term.trim() ||
          typeof card.definition !== 'string',
      )
    ) {
      throw new TypeError('Invalid stored card.')
    }
    return cards.map((card) => ({
      ...card,
      contentSource: card.contentSource || 'unknown',
    }))
  } catch (error) {
    throw new StorageError('无法读取本地卡片库。', error)
  }
}

export function saveCards(cards, storage) {
  const target = resolveStorage(storage)
  if (!Array.isArray(cards)) {
    throw new StorageError('要保存的卡片数据必须是数组。')
  }

  try {
    target.setItem(STORAGE_KEY, JSON.stringify(cards))
    return cards
  } catch (error) {
    throw new StorageError('无法保存卡片，请检查浏览器存储空间。', error)
  }
}

export function addCards(newCards, storage) {
  const existing = getCards(storage)
  const existingByKey = new Map(existing.map((card) => [cardKey(card), card]))
  const refreshedKeys = new Set()
  const nextNewCards = []

  newCards.forEach((card) => {
    const key = cardKey(card)
    if (refreshedKeys.has(key)) return
    const previous = existingByKey.get(key)
    refreshedKeys.add(key)
    nextNewCards.push(
      previous
        ? {
            ...previous,
            ...card,
            id: previous.id,
            createdAt: previous.createdAt,
            reviewWeight: previous.reviewWeight,
            wrongCount: previous.wrongCount,
            correctCount: previous.correctCount,
            lastReviewedAt: previous.lastReviewedAt,
          }
        : card,
    )
  })

  return saveCards(
    [
      ...nextNewCards,
      ...existing.filter((card) => !refreshedKeys.has(cardKey(card))),
    ],
    storage,
  )
}

export function updateCard(updatedCard, storage) {
  const cards = getCards(storage)
  const nextCards = cards.map((card) =>
    card.id === updatedCard.id ? updatedCard : card,
  )
  return saveCards(nextCards, storage)
}

export function deleteCard(cardId, storage) {
  const cards = getCards(storage)
  return saveCards(
    cards.filter((card) => card.id !== cardId),
    storage,
  )
}

export function parseBackup(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new StorageError('文件不是有效的 JSON，请选择 TechLex 备份。')
  }
  if (
    !Array.isArray(data) &&
    (data?.format !== 'techlex' || data?.version !== 1)
  ) {
    throw new StorageError('不支持此备份格式或版本。')
  }
  const cards = Array.isArray(data) ? data : data.cards
  if (!Array.isArray(cards) || cards.length > 5000) {
    throw new StorageError('备份必须包含卡片数组，且不超过 5,000 张。')
  }
  return cards.map((card, index) => {
    if (
      !card ||
      typeof card.term !== 'string' ||
      !card.term.trim() ||
      typeof card.definition !== 'string' ||
      !card.definition.trim()
    ) {
      throw new StorageError(
        '第 ' + (index + 1) + ' 张卡片缺少术语或英文释义，未导入任何数据。',
      )
    }
    const result = { id: crypto.randomUUID() }
    for (const field of [
      'term',
      'translation',
      'definition',
      'definitionZh',
      'example',
      'exampleZh',
      'context',
      'contextZh',
      'sourceSentence',
    ]) {
      if (card[field] != null && typeof card[field] !== 'string') {
        throw new StorageError(
          '第 ' + (index + 1) + ' 张卡片的 ' + field + ' 字段格式不正确。',
        )
      }
      result[field] = (card[field] || '')
        .trim()
        .slice(0, field === 'term' ? 200 : 2000)
    }
    result.contentSource = ['ai', 'demo', 'placeholder', 'unknown'].includes(
      card.contentSource,
    )
      ? card.contentSource
      : 'unknown'
    result.createdAt = Number.isFinite(Date.parse(card.createdAt))
      ? card.createdAt
      : new Date().toISOString()
    result.lastReviewedAt = Number.isFinite(Date.parse(card.lastReviewedAt))
      ? card.lastReviewedAt
      : null
    for (const field of ['correctCount', 'wrongCount']) {
      result[field] = Number.isFinite(Number(card[field]))
        ? Math.max(0, Math.floor(Number(card[field])))
        : 0
    }
    result.reviewWeight = Number.isFinite(Number(card.reviewWeight))
      ? Math.min(5, Math.max(0.25, Number(card.reviewWeight)))
      : 1
    return result
  })
}
