import InputPanel from './InputPanel.jsx'
import Icon from './Icon.jsx'
import SourceBadge from './SourceBadge.jsx'

export default function ExtractWorkspace({
  text,
  setText,
  terms,
  setTerms,
  phase,
  onExtract,
  onGenerate,
  onLibrary,
}) {
  const busy = phase !== 'idle'
  const selected = terms.filter(
    (item) => item.selected && item.status !== 'done',
  )
  const done = terms.filter((item) => item.status === 'done').length
  const failed = terms.filter((item) => item.status === 'error')
  const demo = import.meta.env.VITE_USE_MOCK_API === 'true'
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">A LITTLE LEARNING, EVERY DAY</p>
          <h1>
            把读过的，变成会用的<span className="brand-dot">。</span>
          </h1>
          <p>留住技术文档里的好表达，为下一次阅读和写作积累底气。</p>
        </div>
        <div className="chapter-mark" aria-hidden="true">
          Aa<span>你的技术英语笔记</span>
        </div>
      </div>
      <div className="flow-strip">
        <span className="current">
          <b>1</b> 粘贴原文
        </span>
        <span className="flow-line" />
        <span className={terms.length ? 'current' : ''}>
          <b>2</b> 挑选表达
        </span>
        <span className="flow-line" />
        <span className={done ? 'current' : ''}>
          <b>3</b> 收进词库
        </span>
      </div>
      <div className="extract-grid">
        <InputPanel
          text={text}
          onTextChange={setText}
          onSubmit={onExtract}
          isLoading={busy}
        />
        <section
          className="panel candidates-panel"
          aria-labelledby="candidates-title"
        >
          <div className="panel-heading">
            <div>
              <span className="step-number">02</span>
              <h2 id="candidates-title">值得留下的表达</h2>
            </div>
            <span className="count-pill">
              {terms.length ? terms.length + ' 个' : '待提取'}
            </span>
          </div>
          {terms.length === 0 ? (
            <div className="candidate-empty">
              <div className="paper-stack" aria-hidden="true">
                <div className="sample-paper">
                  <span>IN CONTEXT</span>
                  <strong>
                    Words worth
                    <br />
                    keeping.
                  </strong>
                  <i />
                  <i />
                  <i />
                </div>
                <span className="paper-seal">
                  <Icon name="spark" size={23} />
                </span>
              </div>
              <h3>
                {phase === 'extracting'
                  ? '正在阅读你的文本…'
                  : '你的下一次积累，从这里开始'}
              </h3>
              <p>
                {phase === 'extracting'
                  ? '正在挑选有用的术语与固定表达。'
                  : '提取后在这里挑选想学的表达，\n熟悉的词，可以留到下次。'}
              </p>
            </div>
          ) : (
            <>
              <div className="candidate-toolbar">
                <span>
                  {done
                    ? '已保存 ' + done + ' / ' + terms.length + ' 个'
                    : '保留你想学的，取消已熟悉的'}
                </span>
                <button
                  type="button"
                  className="text-button"
                  disabled={busy}
                  onClick={() =>
                    setTerms((items) =>
                      items.map((item) => ({
                        ...item,
                        selected:
                          item.status === 'done' ||
                          !items.every(
                            (t) => t.selected || t.status === 'done',
                          ),
                      })),
                    )
                  }
                >
                  全选 / 取消
                </button>
              </div>
              <div className="candidate-list">
                {terms.map((item) => (
                  <div
                    className={
                      'candidate ' + (item.status === 'done' ? 'complete' : '')
                    }
                    key={item.term}
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={item.selected}
                        disabled={busy || item.status === 'done'}
                        onChange={(e) =>
                          setTerms((items) =>
                            items.map((t) =>
                              t.term === item.term
                                ? { ...t, selected: e.target.checked }
                                : t,
                            ),
                          )
                        }
                      />
                      <span>
                        <strong>{item.term}</strong>
                        <span className="candidate-context">
                          {item.context_sentence}
                        </span>
                      </span>
                    </label>
                    {item.status === 'done' && (
                      <div className="candidate-result">
                        <Icon name="check" size={15} />
                        <span>{item.card.translation}</span>
                        <SourceBadge source={item.card.contentSource} />
                      </div>
                    )}
                    {item.status === 'error' && (
                      <div className="candidate-error">
                        <span>{item.error}</span>
                        <button
                          className="text-button"
                          disabled={busy}
                          onClick={() => onGenerate([item])}
                        >
                          重试
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {phase === 'generating' && (
                <p className="generation-status" role="status">
                  <span className="spinner" />
                  正在生成并保存，完成的词条会立即显示…
                </p>
              )}
              <div className="candidate-actions">
                <button
                  className="primary-button"
                  disabled={busy || !selected.length}
                  onClick={() => onGenerate(selected)}
                >
                  {phase === 'generating'
                    ? '正在生成…'
                    : '生成所选卡片' +
                      (selected.length ? ' · ' + selected.length : '')}
                  <Icon name="arrow" size={17} />
                </button>
                {done > 0 && (
                  <button className="text-button" onClick={onLibrary}>
                    前往词库 →
                  </button>
                )}
              </div>
              {failed.length > 0 && (
                <p className="muted small">
                  失败的词条可以单独重试，已保存的卡片不会丢失。
                </p>
              )}
            </>
          )}
        </section>
      </div>
      <div className="workspace-tips">
        <div>
          <Icon name="book" />
          <p>
            <strong>语境，比孤立的单词更重要</strong>
            <span>每张卡片保留原文，让你记住这个表达为什么出现在这里。</span>
          </p>
        </div>
        <div>
          <span className={'mode-pill ' + (demo ? 'demo' : '')}>
            {demo ? '演示说明' : '数据说明'}
          </span>
          <p>
            <span>
              {demo
                ? '当前使用本地演示词条。占位解释会明确标注，并排除在复习之外；真实 AI 模式可通过项目启动器开启。'
                : '提取和生成时，文本及选中术语的语境将发送给 DeepSeek；卡片保存在此浏览器。'}
            </span>
          </p>
        </div>
      </div>
    </>
  )
}
