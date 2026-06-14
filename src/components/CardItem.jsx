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
      <p className="definition">{card.definition}</p>

      <dl>
        <div>
          <dt>EXAMPLE</dt>
          <dd>{card.example}</dd>
        </div>
        <div>
          <dt>WHEN TO USE</dt>
          <dd>{card.context}</dd>
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
