import { useState } from 'react'
import CardList from './components/CardList.jsx'
import InputPanel from './components/InputPanel.jsx'
import Layout from './components/Layout.jsx'
import QuizMode from './components/QuizMode.jsx'
import { generateCard } from './services/cardGenerator.js'
import { extractTerms } from './services/termExtractor.js'
import {
  addCards,
  deleteCard,
  getCards,
  updateCard,
} from './storage/localStore.js'
import { updateReviewStats } from './logic/spacedRepetition.js'

function loadInitialCards() {
  try {
    return { cards: getCards(), error: '' }
  } catch (error) {
    return {
      cards: [],
      error: `${error.message} 你可以清除损坏的浏览器存储后重试。`,
    }
  }
}

export default function App() {
  const initial = loadInitialCards()
  const [cards, setCards] = useState(initial.cards)
  const [mode, setMode] = useState('library')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState(initial.error)
  const [notice, setNotice] = useState('')

  async function handleGenerate(text) {
    setIsLoading(true)
    setError('')
    setNotice('')
    setProgress('正在筛选值得学习的术语…')

    try {
      const terms = await extractTerms(text)
      const generatedCards = []
      const failures = []

      for (const [index, item] of terms.entries()) {
        setProgress(`正在生成第 ${index + 1}/${terms.length} 张卡片：${item.term}`)
        try {
          generatedCards.push(
            await generateCard(item.term, item.context_sentence),
          )
        } catch (cardError) {
          failures.push(`${item.term}：${cardError.message}`)
        }
      }

      if (generatedCards.length === 0) {
        throw new Error(failures[0] || '没有生成可保存的卡片。')
      }

      const savedCards = addCards(generatedCards)
      setCards(savedCards)
      setNotice(
        failures.length > 0
          ? `已保存 ${generatedCards.length} 张卡片，${failures.length} 张生成失败。`
          : `已保存 ${generatedCards.length} 张新卡片。`,
      )
    } catch (requestError) {
      setError(requestError.message || '生成卡片失败，请稍后重试。')
    } finally {
      setIsLoading(false)
      setProgress('')
    }
  }

  function handleDelete(cardId) {
    try {
      setCards(deleteCard(cardId))
      setNotice('卡片已从本地卡片库删除。')
      setError('')
    } catch (storageError) {
      setError(storageError.message)
    }
  }

  function handleReview(card, isCorrect) {
    try {
      const reviewedCard = updateReviewStats(card, isCorrect)
      setCards(updateCard(reviewedCard))
      setError('')
      return reviewedCard
    } catch (storageError) {
      setError(storageError.message)
      return card
    }
  }

  return (
    <Layout
      mode={mode}
      onModeChange={setMode}
      cardCount={cards.length}
    >
      {mode === 'library' ? (
        <div className="space-y-8">
          <section className="hero-grid">
            <div>
              <p className="eyebrow">Technical English, made reusable</p>
              <h1 className="hero-title">
                把读过的技术文档，
                <span>变成真正会用的词汇。</span>
              </h1>
              <p className="hero-copy">
                粘贴一段英文技术内容，TechLex 会提取关键表达、生成语境卡片，
                并保存到你的浏览器中。
              </p>
            </div>
            <div className="metric-panel" aria-label="卡片库统计">
              <span className="metric-value">{cards.length}</span>
              <span className="metric-label">CARDS IN YOUR LIBRARY</span>
              <div className="metric-line" />
              <p>本地保存 · 无需账号 · 随时复习</p>
            </div>
          </section>

          <InputPanel
            onSubmit={handleGenerate}
            isLoading={isLoading}
            progress={progress}
            error={error}
            notice={notice}
          />

          <CardList cards={cards} onDelete={handleDelete} />
        </div>
      ) : (
        <QuizMode
          cards={cards}
          onReview={handleReview}
          onBack={() => setMode('library')}
        />
      )}
    </Layout>
  )
}
