export default function SourceBadge({ source }) {
  const labels = {
    ai: 'AI 生成',
    demo: '演示词条',
    placeholder: '演示占位 · 不参与复习',
    unknown: '来源未知',
  }
  return (
    <span className={`source-badge ${source || 'unknown'}`}>
      {labels[source] || labels.unknown}
    </span>
  )
}
