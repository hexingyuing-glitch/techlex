import { useEffect, useMemo, useState } from 'react'
import {
  normalizeAnswer,
  selectWeightedCard,
} from '../logic/spacedRepetition.js'

function maskTerm(example, term) {
  if (!example || !term) return example
  const patterns = [
    term,
    ...term.split(/\s+/).filter((word) => word.length >= 4),
  ].sort((a, b) => b.length - a.length)

  return patterns.reduce((masked, pattern) => {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return masked.replace(new RegExp(escaped, 'gi'), '________')
  }, example)
}

export default function QuizMode({ cards, onReview, onBack }) {
  const [currentId, setCurrentId] = useState(cards[0]?.id ?? null)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)

  const currentCard = useMemo(
    () => cards.find((card) => card.id === currentId) ?? cards[0] ?? null,
    [cards, currentId],
  )

  useEffect(() => {
    if (cards.length > 0 && !cards.some((card) => card.id === currentId)) {
      setCurrentId(cards[0].id)
      setAnswer('')
      setResult(null)
    }
  }, [cards, currentId])

  function handleSubmit(event) {
    event.preventDefault()
    if (!currentCard || !answer.trim() || result) return

    const isCorrect =
      normalizeAnswer(answer) === normalizeAnswer(currentCard.term)
    onReview(currentCard, isCorrect)
    setResult(isCorrect ? 'correct' : 'incorrect')
  }

  function handleNext() {
    const nextCard = selectWeightedCard(cards, {
      excludeId: cards.length > 1 ? currentCard?.id : undefined,
    })
    setCurrentId(nextCard?.id ?? null)
    setAnswer('')
    setResult(null)
  }

  if (cards.length === 0) {
    return (
      <section className="quiz-empty">
        <p className="step-label">REVIEW MODE</p>
        <h1>还没有可以复习的卡片</h1>
        <p>先回到卡片库，从一段技术文本生成术语卡片。</p>
        <button type="button" className="primary-button" onClick={onBack}>
          返回卡片库
        </button>
      </section>
    )
  }

  return (
    <section className="quiz-shell" aria-labelledby="quiz-title">
      <div className="quiz-header">
        <div>
          <p className="step-label">REVIEW / WEIGHTED PRACTICE</p>
          <h1 id="quiz-title">根据定义写出术语</h1>
        </div>
        <span>{cards.length} CARDS</span>
      </div>

      <article className="quiz-card">
        <div className="quiz-number">?</div>
        <p className="quiz-definition">{currentCard.definition}</p>
        <p className="quiz-context">{currentCard.context}</p>
        <blockquote>{maskTerm(currentCard.example, currentCard.term)}</blockquote>

        <form onSubmit={handleSubmit}>
          <label htmlFor="quiz-answer">YOUR ANSWER</label>
          <div className="answer-row">
            <input
              id="quiz-answer"
              value={answer}
              disabled={Boolean(result)}
              autoComplete="off"
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Type the technical term…"
            />
            <button
              type="submit"
              className="primary-button"
              disabled={!answer.trim() || Boolean(result)}
            >
              检查答案
            </button>
          </div>
        </form>

        {result ? (
          <div
            className={`quiz-result ${result}`}
            role="status"
            aria-live="polite"
          >
            <div>
              <strong>{result === 'correct' ? '回答正确' : '再记一次'}</strong>
              <span>
                正确术语：<b>{currentCard.term}</b>
              </span>
            </div>
            <button type="button" onClick={handleNext}>
              下一张 →
            </button>
          </div>
        ) : null}
      </article>

      <p className="quiz-note">
        答错的卡片会提高复习权重，因此更可能再次出现。
      </p>
    </section>
  )
}
