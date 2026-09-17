import Icon from './Icon.jsx'

export default function Layout({
  children,
  mode,
  onModeChange,
  cardCount,
  reviewCount,
}) {
  const demo = import.meta.env.VITE_USE_MOCK_API === 'true'
  const tabs = [
    ['extract', '提取新词', 'spark'],
    ['library', '我的词库', 'book'],
    ['quiz', '今日复习', 'review'],
  ]
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        跳到主要内容
      </a>
      <aside className="sidebar">
        <a
          className="brand"
          href="#extract"
          onClick={() => onModeChange('extract')}
          aria-label="TechLex 首页"
        >
          <span className="brand-mark">
            <Icon name="book" size={24} />
          </span>
          <span>
            <strong>
              TechLex<span className="brand-dot">.</span>
            </strong>
            <small>技术英语学习笔记</small>
          </span>
        </a>
        <div className="nav-label">你的学习空间</div>
        <nav aria-label="主导航">
          {tabs.map(([key, label, icon]) => (
            <button
              key={key}
              className={'nav-item ' + (mode === key ? 'active' : '')}
              onClick={() => onModeChange(key)}
              aria-current={mode === key ? 'page' : undefined}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {key !== 'extract' && (
                <span className="nav-count">
                  {key === 'library' ? cardCount : reviewCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <Icon name="leaf" size={26} />
          <p>
            让每一次阅读，
            <br />
            都有一点积累。
          </p>
          <small>
            从真实语境中学习，
            <br />
            在下一次表达中用出来。
          </small>
        </div>
        <div className="local-note">
          <span className="status-dot" /> 保存在此浏览器{' '}
          <small>无需账号 · 记得定期备份</small>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            学习空间 <span className="crumb">/</span>{' '}
            <strong>{tabs.find(([key]) => key === mode)?.[1]}</strong>
          </span>
          <span className={'mode-pill ' + (demo ? 'demo' : '')}>
            <span className="status-dot" />
            {demo ? '演示模式' : 'AI 模式'}
          </span>
        </header>
        <main id="main-content" tabIndex={-1}>{children}</main>
        <footer className="site-footer">
          <span>少一点死记硬背，多一点真实语境。</span>
          <span>TECHLEX · READ. KEEP. RECALL.</span>
        </footer>
      </div>
    </div>
  )
}
