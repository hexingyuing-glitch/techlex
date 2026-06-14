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
    return cards
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
    [...nextNewCards, ...existing.filter((card) => !refreshedKeys.has(cardKey(card)))],
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
