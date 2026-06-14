import { useState } from 'react'

const MAX_TEXT_LENGTH = 12000

export default function InputPanel({
  onSubmit,
  isLoading,
  progress,
  error,
  notice,
}) {
  const [text, setText] = useState('')
  const [validationError, setValidationError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const cleanText = text.trim()

    if (!cleanText) {
      setValidationError('请先粘贴一段英文技术文本。')
      return
    }

    setValidationError('')
    onSubmit(cleanText)
  }

  return (
    <section className="input-panel" aria-labelledby="input-title">
      <div className="section-heading">
        <div>
          <p className="step-label">STEP 01 / SOURCE</p>
          <h2 id="input-title">粘贴技术文本</h2>
        </div>
        <p>建议使用 README、API 文档或技术博客中的 100-800 个英文单词。</p>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="source-text">
          英文技术文本
        </label>
        <textarea
          id="source-text"
          value={text}
          maxLength={MAX_TEXT_LENGTH}
          disabled={isLoading}
          onChange={(event) => {
            setText(event.target.value)
            if (validationError) setValidationError('')
          }}
          placeholder="Paste an English README, API reference, or technical article here…"
        />

        <div className="input-actions">
          <span className="character-count">
            {text.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}
          </span>
          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                正在生成
              </>
            ) : (
              <>
                提取术语并生成卡片
                <span aria-hidden="true">↗</span>
              </>
            )}
          </button>
        </div>
      </form>

      {isLoading && progress ? (
        <p className="status-message loading" role="status">
          {progress}
        </p>
      ) : null}
      {validationError || error ? (
        <p className="status-message error" role="alert">
          {validationError || error}
        </p>
      ) : null}
      {!isLoading && notice ? (
        <p className="status-message success" role="status">
          {notice}
        </p>
      ) : null}
    </section>
  )
}
