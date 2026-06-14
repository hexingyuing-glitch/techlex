const MIN_WEIGHT = 0.25
const MAX_WEIGHT = 5

export function normalizeAnswer(value) {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ')
}

export function updateReviewStats(card, isCorrect, now = new Date()) {
  const currentWeight = Number.isFinite(Number(card.reviewWeight))
    ? Number(card.reviewWeight)
    : 1

  return {
    ...card,
    correctCount: Number(card.correctCount || 0) + (isCorrect ? 1 : 0),
    wrongCount: Number(card.wrongCount || 0) + (isCorrect ? 0 : 1),
    reviewWeight: isCorrect
      ? Math.max(MIN_WEIGHT, Number((currentWeight * 0.75).toFixed(2)))
      : Math.min(MAX_WEIGHT, Number((currentWeight + 1).toFixed(2))),
    lastReviewedAt: now.toISOString(),
  }
}

export function selectWeightedCard(
  cards,
  { excludeId, random = Math.random } = {},
) {
  if (!Array.isArray(cards) || cards.length === 0) return null

  const candidates =
    excludeId && cards.length > 1
      ? cards.filter((card) => card.id !== excludeId)
      : cards

  const weights = candidates.map((card) =>
    Math.max(MIN_WEIGHT, Number(card.reviewWeight) || 1),
  )
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let cursor = Math.min(Math.max(random(), 0), 0.999999999) * totalWeight

  for (let index = 0; index < candidates.length; index += 1) {
    cursor -= weights[index]
    if (cursor < 0) return candidates[index]
  }

  return candidates.at(-1)
}
