import { useState } from 'react'
import {
  normalizeAnswer,
  selectWeightedCard,
} from '../logic/spacedRepetition.js'
import Icon from './Icon.jsx'
import SourceBadge from './SourceBadge.jsx'

export function maskTerm(example, term) {
  if (!example || !term) return example
  const patterns = [
    term,
    ...term.split(/\s+/).filter((word) => word.length >= 4),
  ].sort((a, b) => b.length - a.length)
  return patterns.reduce(
    (masked, pattern) =>
      masked.replace(
        new RegExp(pattern.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&'), 'gi'),
        '________',
      ),
    example,
  )
}

function createRound(cards) {
  const remaining = cards.filter((card) => card.contentSource !== 'placeholder')
  const round = []
  while (remaining.length && round.length < 10) {
    const card = selectWeightedCard(remaining)
    round.push(card)
    remaining.splice(
      remaining.findIndex((item) => item.id === card.id),
      1,
    )
  }
  return round
}

export default function QuizMode({ cards, onReview, onBack }) {
  const [round, setRound] = useState(() => createRound(cards))
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [answers, setAnswers] = useState([])
  const [hint, setHint] = useState(false)
  const [saveError, setSaveError] = useState('')
  const current = round[index]
  const finished = round.length > 0 && index >= round.length
  function restart() {
    setRound(createRound(cards))
    setIndex(0)
    setAnswer('')
    setResult(null)
    setAnswers([])
    setHint(false)
    setSaveError('')
  }
  function submit(isCorrect) {
    if (!current || result) return
    const saved = onReview(current, isCorrect)
    if (saved === false) {
      setSaveError('本次结果未保存，请处理存储错误后重试。')
      return
    }
    setSaveError('')
    setResult(isCorrect ? 'correct' : 'incorrect')
    setAnswers((previous) => [
      ...previous,
      { card: current, correct: isCorrect },
    ])
  }
  if (!round.length)
    return (
      <div className="empty-state quiz-empty">
        <span className="empty-icon">
          <Icon name="review" size={32} />
        </span>
        <h1>还没有可以复习的卡片</h1>
        <p>先收集一些表达。演示占位卡片不会进入复习。</p>
        <button className="primary-button" onClick={onBack}>
          返回词库
        </button>
      </div>
    )
  if (finished)
    return (
      <section className="round-summary">
        <span className="empty-icon">
          <Icon name="check" size={34} />
        </span>
        <p className="eyebrow">A LITTLE PROGRESS, WELL KEPT</p>
        <h1>
          这一轮，完成了<span className="brand-dot">。</span>
        </h1>
        <p>今天多熟悉一个表达，下一次阅读就少一点停顿。</p>
        <div className="summary-metrics">
          <div>
            <strong>{round.length}</strong>
            <span>本轮复习</span>
          </div>
          <div>
            <strong>{answers.filter((a) => a.correct).length}</strong>
            <span>回答正确</span>
          </div>
          <div>
            <strong>{answers.filter((a) => !a.correct).length}</strong>
            <span>需要再练</span>
          </div>
        </div>
        {answers.some((a) => !a.correct) && (
          <div className="retry-words">
            <h2>这些表达，值得再见一面</h2>
            {answers
              .filter((a) => !a.correct)
              .map((a) => (
                <span key={a.card.id}>{a.card.term}</span>
              ))}
          </div>
        )}
        <div className="button-row">
          <button className="primary-button" onClick={restart}>
            再练一轮 <Icon name="arrow" size={17} />
          </button>
          <button className="secondary-button" onClick={onBack}>
            回到词库
          </button>
        </div>
      </section>
    )
  return (
    <section className="quiz-shell">
      <div className="page-heading">
        <div>
          <p className="eyebrow">A MOMENT TO RECALL</p>
          <h1>
            给记忆一点时间<span className="brand-dot">。</span>
          </h1>
          <p>先试着回想，想不起来也没关系。</p>
        </div>
        <button className="text-button" onClick={onBack}>
          退出本轮
        </button>
      </div>
      <div className="quiz-progress">
        <span>本轮进度</span>
        <strong>
          {index + 1} / {round.length}
        </strong>
      </div>
      <progress
        aria-label="本轮已完成"
        value={index + (result ? 1 : 0)}
        max={round.length}
      />
      <article className="quiz-card" key={current.id}>
        <div className="card-topline">
          <span className="quiet-label">RECALL THE EXPRESSION</span>
          <SourceBadge source={current.contentSource} />
        </div>
        <p className="quiz-prompt">根据定义，写出英文表达</p>
        <h2 className="quiz-definition">
          {maskTerm(current.definition, current.term)}
        </h2>
        <button
          className="text-button hint-button"
          aria-expanded={hint}
          onClick={() => setHint(!hint)}
        >
          {hint ? '收起中文提示' : '需要一点中文提示？'}
        </button>
        {hint && (
          <p className="hint-copy">
            {maskTerm(
              current.definitionZh || current.translation || '暂无中文提示',
              current.term,
            )}
          </p>
        )}
        {current.example && (
          <blockquote className="quiz-context">
            <span>在句子里想一想</span>
            {maskTerm(current.example, current.term)}
          </blockquote>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (answer.trim())
              submit(normalizeAnswer(answer) === normalizeAnswer(current.term))
          }}
        >
          <label htmlFor="quiz-answer">你的答案</label>
          <div className="answer-row">
            <input
              id="quiz-answer"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={answer}
              disabled={Boolean(result)}
              placeholder="写下你想到的英文术语…"
              onChange={(e) => setAnswer(e.target.value)}
            />
            <button
              className="primary-button"
              disabled={!answer.trim() || Boolean(result)}
            >
              检查答案
            </button>
          </div>
        </form>
        {!result && (
          <button
            className="text-button forget-button"
            onClick={() => submit(false)}
          >
            暂时想不起来，看看答案
          </button>
        )}
        {saveError && (
          <p className="inline-error" role="alert">
            {saveError}
          </p>
        )}
        {result && (
          <div className={'quiz-result ' + result} role="status">
            <div>
              <strong>
                {result === 'correct' ? '回答正确' : '再记一次，下次会更熟悉'}
              </strong>
              <p>
                {current.term} <span>· {current.translation}</span>
              </p>
              {current.sourceSentence && (
                <p className="answer-source">{current.sourceSentence}</p>
              )}
            </div>
            <button
              className="primary-button"
              onClick={() => {
                setIndex(index + 1)
                setAnswer('')
                setResult(null)
                setHint(false)
                setSaveError('')
              }}
            >
              {index + 1 === round.length ? '查看本轮总结' : '下一张'}
              <Icon name="arrow" size={16} />
            </button>
          </div>
        )}
      </article>
      <p className="quiz-note">
        本轮不重复抽题 · 每轮最多 10 张 · 练习记录实时保存
      </p>
    </section>
  )
}
