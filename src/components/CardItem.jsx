import { useState } from 'react'
import SourceBadge from './SourceBadge.jsx'

const fields = [
  ['term', '英文术语'],
  ['translation', '中文含义'],
  ['sourceSentence', '原文语境'],
  ['definition', '英文释义'],
  ['definitionZh', '中文释义'],
  ['example', '英文例句'],
  ['exampleZh', '例句译文'],
  ['context', '使用场景'],
  ['contextZh', '场景译文'],
]

export default function CardItem({ card, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(card)
  const [editError, setEditError] = useState('')
  async function save(event) {
    event.preventDefault()
    const clean = Object.fromEntries(
      fields.map(([key]) => [key, (draft[key] || '').trim()]),
    )
    if (!clean.term || !clean.definition) {
      setEditError('英文术语和英文释义不能为空。')
      return
    }
    if (await onEdit?.({ ...card, ...clean })) setEditing(false)
  }
  return (
    <article className="term-card">
      <div className="card-topline">
        <SourceBadge source={card.contentSource} />
        <span className="learning-status">
          {card.lastReviewedAt
            ? '已练习 ' +
              ((Number(card.correctCount) || 0) +
                (Number(card.wrongCount) || 0)) +
              ' 次'
            : '尚未复习'}
        </span>
      </div>
      <h3>{card.term}</h3>
      <p className="translation">{card.translation || '中文含义待补充'}</p>
      <p className="card-summary">{card.definitionZh || card.definition}</p>
      {card.sourceSentence && (
        <blockquote className="card-source">
          <span>遇见这个表达的地方</span>
          {card.sourceSentence}
        </blockquote>
      )}
      <details className="card-details">
        <summary>
          释义与用法 <span aria-hidden="true">＋</span>
        </summary>
        <div className="detail-content">
          <h4>英文释义</h4>
          <p>{card.definition}</p>
          <h4>试着这样用</h4>
          <p>{card.example || '暂无例句'}</p>
          <details className="translation-toggle">
            <summary>查看中文译文</summary>
            <p>{card.exampleZh || '暂无译文'}</p>
          </details>
          <h4>使用场景</h4>
          <p>{card.context || '暂无场景'}</p>
          <details className="translation-toggle">
            <summary>查看场景译文</summary>
            <p>{card.contextZh || '暂无译文'}</p>
          </details>
        </div>
      </details>
      {editing && (
        <form className="edit-form" onSubmit={save}>
          {fields.map(([key, label]) => (
            <label key={key}>
              {label}
              <textarea
                rows={key === 'term' || key === 'translation' ? 1 : 2}
                required={key === 'term' || key === 'definition'}
                maxLength={key === 'term' ? 200 : 2000}
                value={draft[key] || ''}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              />
            </label>
          ))}
          {editError && (
            <p role="alert" className="inline-error">
              {editError}
            </p>
          )}
          <div className="button-row">
            <button className="primary-button" type="submit">
              保存修改
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setEditing(false)}
            >
              取消
            </button>
          </div>
        </form>
      )}
      <div className="card-bottom">
        <span>
          {card.lastReviewedAt
            ? '答对 ' +
              (card.correctCount || 0) +
              ' · 再练 ' +
              (card.wrongCount || 0)
            : '从语境中记住它'}
        </span>
        <div>
          {onEdit && (
            <button
              className="text-button"
              onClick={() => {
                setDraft(card)
                setEditing(!editing)
                setEditError('')
              }}
              aria-label={'编辑术语 ' + card.term}
            >
              编辑
            </button>
          )}
          <button
            className="text-button danger"
            onClick={() => onDelete(card.id)}
            aria-label={'删除术语 ' + card.term}
          >
            删除
          </button>
        </div>
      </div>
    </article>
  )
}
