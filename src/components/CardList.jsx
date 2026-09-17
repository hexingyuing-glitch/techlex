import { useRef, useState } from 'react'
import CardItem from './CardItem.jsx'
import Icon from './Icon.jsx'

export default function CardList({
  cards,
  onDelete,
  onEdit,
  onExtract,
  onReview,
  onImport,
  onExport,
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('recent')
  const [importing, setImporting] = useState(false)
  const fileInput = useRef(null)
  const filtered = cards
    .filter((card) => {
      const match = [
        card.term,
        card.translation,
        card.definition,
        card.definitionZh,
        card.sourceSentence,
      ].some((value) =>
        String(value || '')
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase()),
      )
      return (
        match &&
        (filter === 'all' ||
          (filter === 'new'
            ? !card.lastReviewedAt
            : (Number(card.wrongCount) || 0) > 0))
      )
    })
    .sort((a, b) =>
      sort === 'alpha'
        ? a.term.localeCompare(b.term)
        : (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0),
    )
  async function importFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      await onImport?.(file)
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR PERSONAL WORD COLLECTION</p>
          <h1>
            每一个表达，都有来处<span className="brand-dot">。</span>
          </h1>
          <p>找回读过的语境，把收藏慢慢变成自己的表达。</p>
        </div>
        <button className="primary-button" onClick={onExtract}>
          <Icon name="spark" size={17} />
          提取新词
        </button>
      </div>
      <div className="library-overview">
        <div>
          <span className="overview-value">
            {cards.length.toString().padStart(2, '0')}
          </span>
          <span>已收藏的表达</span>
        </div>
        <div>
          <span className="overview-value">
            {cards
              .filter(
                (c) => !c.lastReviewedAt && c.contentSource !== 'placeholder',
              )
              .length.toString()
              .padStart(2, '0')}
          </span>
          <span>尚未复习</span>
        </div>
        <button className="review-invitation" onClick={onReview}>
          <Icon name="review" size={25} />
          <span>
            <strong>给记忆一点时间</strong>
            <small>开始一轮，最多 10 张卡片</small>
          </span>
          <Icon name="arrow" />
        </button>
      </div>
      <section aria-labelledby="library-title">
        <div className="library-title-row">
          <h2 id="library-title">
            我的词库 <span className="count-pill">{cards.length}</span>
          </h2>
          <div className="button-row">
            {onImport && (
              <>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".json,application/json"
                  className="sr-only"
                  aria-label="选择备份文件"
                  onChange={importFile}
                  tabIndex={-1}
                />
                <button
                  className="text-button"
                  disabled={importing}
                  onClick={() => fileInput.current?.click()}
                >
                  <Icon name="upload" size={16} />
                  {importing ? '导入中…' : '导入备份'}
                </button>
              </>
            )}
            {onExport && (
              <button
                className="text-button"
                disabled={!cards.length}
                onClick={onExport}
              >
                <Icon name="download" size={16} />
                导出备份
              </button>
            )}
          </div>
        </div>
        <div className="library-toolbar">
          <label className="search-field">
            <Icon name="search" size={18} />
            <input
              aria-label="搜索词库"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索英文术语、中文含义或原文…"
            />
          </label>
          <div className="filter-tabs" aria-label="卡片筛选">
            {[
              ['all', '全部'],
              ['new', '未复习'],
              ['practice', '需要再练'],
            ].map(([key, label]) => (
              <button
                key={key}
                aria-pressed={filter === key}
                className={filter === key ? 'active' : ''}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            aria-label="卡片排序"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recent">最近添加</option>
            <option value="alpha">按字母排序</option>
          </select>
        </div>
        {!cards.length ? (
          <div className="empty-state">
            <span className="empty-icon">
              <Icon name="book" size={32} />
            </span>
            <h3>卡片库还是空的</h3>
            <p>一段正在阅读的技术文档，就是最好的开始。</p>
            <button className="primary-button" onClick={onExtract}>
              去提取第一组表达 <Icon name="arrow" size={17} />
            </button>
          </div>
        ) : !filtered.length ? (
          <div className="empty-state">
            <Icon name="search" size={28} />
            <h3>没有找到匹配的表达</h3>
            <p>换个关键词，或清除筛选再试试。</p>
            <button
              className="secondary-button"
              onClick={() => {
                setQuery('')
                setFilter('all')
              }}
            >
              清除筛选
            </button>
          </div>
        ) : (
          <>
            <p className="results-count">显示 {filtered.length} 个表达</p>
            <div className="card-grid">
              {filtered.map((card) => (
                <CardItem
                  key={card.id}
                  card={card}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  )
}
