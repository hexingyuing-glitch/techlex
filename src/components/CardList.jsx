import CardItem from './CardItem.jsx'

export default function CardList({ cards, onDelete }) {
  return (
    <section aria-labelledby="library-title">
      <div className="section-heading library-heading">
        <div>
          <p className="step-label">STEP 02 / LIBRARY</p>
          <h2 id="library-title">术语卡片</h2>
        </div>
        <p>{cards.length > 0 ? `共 ${cards.length} 张本地卡片` : '等待第一批术语'}</p>
      </div>

      {cards.length === 0 ? (
        <div className="empty-state">
          <span className="empty-index">00</span>
          <div>
            <h3>卡片库还是空的</h3>
            <p>上方粘贴技术文本，生成的术语卡片会出现在这里。</p>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {cards.map((card, index) => (
            <CardItem
              key={card.id}
              card={card}
              index={index}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  )
}
