import { useState } from 'react'
import Icon from './Icon.jsx'

export const EXAMPLE_TEXT =
  'Distributed systems must handle a transient failure without losing data. An idempotent operation can be retried safely after network timeouts. Clients use exponential backoff to avoid overwhelming a busy service. Rate limiting protects the API from sudden traffic spikes.'

export default function InputPanel({
  onSubmit,
  isLoading,
  text: controlledText,
  onTextChange,
}) {
  const [localText, setLocalText] = useState('')
  const [validationError, setValidationError] = useState('')
  const text = controlledText ?? localText
  const setText = onTextChange || setLocalText
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  function submit(event) {
    event.preventDefault()
    if (!text.trim()) {
      setValidationError('请先粘贴一段英文技术文本。')
      return
    }
    setValidationError('')
    onSubmit(text.trim())
  }
  return (
    <section className="panel source-panel" aria-labelledby="input-title">
      <div className="panel-heading">
        <div>
          <span className="step-number">01</span>
          <h2 id="input-title">从一段阅读开始</h2>
        </div>
        <span className="quiet-label">SOURCE TEXT</span>
      </div>
      <p className="panel-description">
        粘贴 README、API 文档或技术文章中的英文片段。
      </p>
      <form onSubmit={submit}>
        <label htmlFor="source-text" className="sr-only">
          英文技术文本
        </label>
        <textarea
          id="source-text"
          value={text}
          maxLength={12000}
          disabled={isLoading}
          onChange={(e) => {
            setText(e.target.value)
            setValidationError('')
          }}
          placeholder={
            '好的表达，藏在你正在读的文档里。\n\nPaste your English text here…'
          }
        />
        <div className="source-tools">
          <button
            className="text-button"
            type="button"
            disabled={isLoading}
            onClick={() => {
              setText(EXAMPLE_TEXT)
              setValidationError('')
            }}
          >
            试试示例文本 <span aria-hidden="true">↗</span>
          </button>
          <span>
            {words} 词 · {text.length.toLocaleString()} / 12,000 字符
          </span>
        </div>
        <div className="source-submit">
          <p>
            建议 100–800 个英文单词
            <br />
            <span>每次最多提取 8 个表达</span>
          </p>
          <button className="primary-button" disabled={isLoading}>
            {isLoading ? (
              <span className="spinner" />
            ) : (
              <Icon name="spark" size={17} />
            )}
            {isLoading ? '处理中…' : '提取术语'}
          </button>
        </div>
      </form>
      {validationError && (
        <p className="inline-error" role="alert">
          {validationError}
        </p>
      )}
    </section>
  )
}
