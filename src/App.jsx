import { useEffect, useState } from 'react'
import CardList from './components/CardList.jsx'
import ExtractWorkspace from './components/ExtractWorkspace.jsx'
import Layout from './components/Layout.jsx'
import QuizMode from './components/QuizMode.jsx'
import Icon from './components/Icon.jsx'
import useExtraction from './hooks/useExtraction.js'
import {
  addCards,
  deleteCard,
  getCards,
  updateCard,
  saveCards,
  parseBackup,
  STORAGE_KEY,
} from './storage/localStore.js'
import { updateReviewStats } from './logic/spacedRepetition.js'

function loadInitialCards() {
  try {
    return { cards: getCards(), error: '' }
  } catch (error) {
    return {
      cards: [],
      error: error.message + ' 原数据仍被保留，请先备份再恢复。',
    }
  }
}
function currentPage() {
  const page = window.location.hash.slice(1)
  return ['extract', 'library', 'quiz'].includes(page) ? page : 'extract'
}
function cardKey(card) {
  return (
    card.term.trim().toLowerCase() +
    '::' +
    (card.sourceSentence || '').trim().toLowerCase()
  )
}

export default function App() {
  const [initial] = useState(loadInitialCards)
  const [cards, setCards] = useState(initial.cards)
  const [mode, setMode] = useState(currentPage)
  const [error, setError] = useState(initial.error)
  const [notice, setNotice] = useState('')
  const [deleted, setDeleted] = useState([])
  const extraction = useExtraction({ setCards, setError, setNotice })
  useEffect(() => {
    const change = () => setMode(currentPage())
    const sync = (event) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        const loaded = loadInitialCards()
        setCards(loaded.cards)
        setError(loaded.error)
      }
    }
    window.addEventListener('hashchange', change)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('hashchange', change)
      window.removeEventListener('storage', sync)
    }
  }, [])
  function navigate(next) {
    window.location.hash = next
    setMode(next)
  }
  function handleDelete(id) {
    try {
      const card = getCards().find((item) => item.id === id)
      setCards(deleteCard(id))
      if (card) setDeleted((previous) => [...previous, card])
      setNotice('已删除「' + (card?.term || '术语') + '」。')
      setError('')
    } catch (problem) {
      setError(problem.message)
    }
  }
  function undoDelete() {
    try {
      const card = deleted.at(-1)
      if (!card) return
      const existing = getCards()
      if (
        existing.some(
          (item) => item.id === card.id || cardKey(item) === cardKey(card),
        )
      ) {
        setNotice('词库已有相同表达，保留现有内容。')
      } else {
        setCards(saveCards([card, ...existing]))
        setNotice('已恢复「' + card.term + '」。')
      }
      setDeleted((previous) => previous.slice(0, -1))
      setError('')
    } catch (problem) {
      setError(problem.message)
    }
  }
  function handleEdit(card) {
    try {
      const current = getCards()
      if (!current.some((item) => item.id === card.id))
        throw new Error('这张卡片已被删除，请刷新词库。')
      if (
        current.some(
          (item) => item.id !== card.id && cardKey(item) === cardKey(card),
        )
      )
        throw new Error('已有同一术语、同一原文的卡片，请避免重复。')
      setCards(updateCard(card))
      setNotice('卡片已更新。')
      setError('')
      return true
    } catch (problem) {
      setError(problem.message)
      return false
    }
  }
  function handleReview(card, isCorrect) {
    try {
      const latest = getCards().find((item) => item.id === card.id)
      if (!latest) throw new Error('这张卡片已被删除，请返回词库重新开始。')
      const reviewed = updateReviewStats(latest, isCorrect)
      setCards(updateCard(reviewed))
      setError('')
      return reviewed
    } catch (problem) {
      setError(problem.message)
      return false
    }
  }
  async function handleImport(file) {
    try {
      if (file.size > 10 * 1024 * 1024)
        throw new Error('备份文件不能超过 10 MB。')
      const incoming = parseBackup(await file.text())
      const existing = getCards()
      const keys = new Set(existing.map(cardKey))
      const unique = incoming.filter((card) => {
        const key = cardKey(card)
        if (keys.has(key)) return false
        keys.add(key)
        return true
      })
      setCards(addCards(unique))
      setNotice(
        '导入 ' +
          unique.length +
          ' 张，跳过 ' +
          (incoming.length - unique.length) +
          ' 张重复卡片；现有记录已保留。',
      )
      setError('')
    } catch (problem) {
      setError(problem.message)
    }
  }
  function handleExport() {
    try {
      const backup = {
        format: 'techlex',
        version: 1,
        exportedAt: new Date().toISOString(),
        cards: getCards(),
      }
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(backup, null, 2)], {
          type: 'application/json',
        }),
      )
      const link = document.createElement('a')
      link.href = url
      link.download =
        'techlex-backup-' + new Date().toISOString().slice(0, 10) + '.json'
      document.body.append(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice('已生成备份，请保管好下载的 JSON 文件。')
      setError('')
    } catch (problem) {
      setError(problem.message)
    }
  }
  return (
    <Layout
      mode={mode}
      onModeChange={navigate}
      cardCount={cards.length}
      reviewCount={
        cards.filter((card) => card.contentSource !== 'placeholder').length
      }
    >
      {error && (
        <div className="global-message error" role="alert">
          <span>{error}</span>
          <button
            className="icon-button"
            aria-label="关闭错误提示"
            onClick={() => setError('')}
          >
            <Icon name="close" size={17} />
          </button>
        </div>
      )}
      {(notice || deleted.length > 0) && (
        <div className="global-message success" role="status">
          <span>{notice || '可撤销本次会话中的删除。'}</span>
          <div className="button-row">
            {deleted.length > 0 && (
              <button className="text-button" onClick={undoDelete}>
                撤销删除{deleted.length > 1 ? '（' + deleted.length + '）' : ''}
              </button>
            )}
            {notice && (
              <button
                className="icon-button"
                aria-label="关闭通知"
                onClick={() => setNotice('')}
              >
                <Icon name="close" size={17} />
              </button>
            )}
          </div>
        </div>
      )}
      {extraction.phase !== 'idle' && mode !== 'extract' && (
        <div className="global-message" role="status">
          <span>你的文本正在处理中。</span>
          <button className="text-button" onClick={() => navigate('extract')}>
            查看进度 →
          </button>
        </div>
      )}
      {mode === 'extract' && (
        <ExtractWorkspace
          {...extraction}
          onLibrary={() => navigate('library')}
        />
      )}
      {mode === 'library' && (
        <CardList
          cards={cards}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onExtract={() => navigate('extract')}
          onReview={() => navigate('quiz')}
          onImport={handleImport}
          onExport={handleExport}
        />
      )}
      {mode === 'quiz' && (
        <QuizMode
          cards={cards}
          onReview={handleReview}
          onBack={() => navigate('library')}
        />
      )}
    </Layout>
  )
}
