// Bounded workers report each result immediately, without waiting for a batch.
export async function generateSelected(
  items,
  generate,
  onResult,
  concurrency = 3,
) {
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const item = items[cursor++]
      let result
      try {
        result = { card: await generate(item.term, item.context_sentence) }
      } catch (error) {
        result = { error: error.message || '生成失败，请重试。' }
      }
      await onResult(item, result)
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker),
  )
}
