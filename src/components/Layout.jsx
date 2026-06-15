export default function Layout({
  children,
  mode,
  onModeChange,
  cardCount,
}) {
  const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true'

  return (
    <div className="app-shell">
      <header className="site-header">
        <a
          className="brand"
          href="#top"
          onClick={() => onModeChange('library')}
          aria-label="返回 TechLex 卡片库"
        >
          <span className="brand-mark">TL</span>
          <span>
            <strong>TechLex</strong>
            <small>TECHNICAL ENGLISH LAB</small>
          </span>
        </a>

        <nav className="mode-switch" aria-label="主导航">
          {isMockMode ? <span className="mode-badge">动态演示</span> : null}
          <button
            type="button"
            className={mode === 'library' ? 'active' : ''}
            onClick={() => onModeChange('library')}
          >
            卡片库
          </button>
          <button
            type="button"
            className={mode === 'quiz' ? 'active' : ''}
            onClick={() => onModeChange('quiz')}
          >
            复习模式
            <span>{cardCount}</span>
          </button>
        </nav>
      </header>

      <main id="top" className="page-content">
        {children}
      </main>

      <footer className="site-footer">
        <span>TechLex / Local-first vocabulary practice</span>
        <span>{isMockMode ? 'Dynamic local demo' : 'Powered by DeepSeek'}</span>
      </footer>
    </div>
  )
}
