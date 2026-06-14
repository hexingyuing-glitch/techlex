export default function CardItem({ card, index, onDelete }) {
  return (
    <article className="term-card">
      <div className="card-topline">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <button
          className="delete-button"
          type="button"
          onClick={() => onDelete(card.id)}
          aria-label={`删除术语 ${card.term}`}
        >
          删除
        </button>
      </div>

      <h3>{card.term}</h3>
      <p className="translation">
        {card.translation || '中文释义待补充'}
      </p>

      <dl>
        <div>
          <dt>DEFINITION / 释义</dt>
          <dd>{card.definition}</dd>
          <dd className="chinese-copy">
            {card.definitionZh || '这是一张旧卡片，尚未包含中文解释。'}
          </dd>
        </div>
        <div>
          <dt>EXAMPLE / 例句</dt>
          <dd>{card.example}</dd>
          <dd className="chinese-copy">
            {card.exampleZh || '中文译文待补充。'}
          </dd>
        </div>
        <div>
          <dt>WHEN TO USE / 使用场景</dt>
          <dd>{card.context}</dd>
          <dd className="chinese-copy">
            {card.contextZh || '中文场景说明待补充。'}
          </dd>
        </div>
        {card.sourceSentence ? (
          <div className="source-row">
            <dt>SOURCE</dt>
            <dd>{card.sourceSentence}</dd>
          </div>
        ) : null}
      </dl>

      <div className="card-stats">
        <span>正确 {card.correctCount || 0}</span>
        <span>错误 {card.wrongCount || 0}</span>
        <span>权重 {Number(card.reviewWeight || 1).toFixed(2)}</span>
      </div>
    </article>
  )
}
