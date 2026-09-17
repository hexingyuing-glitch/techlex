import { useRef, useState } from 'react'
import { extractTerms } from '../services/termExtractor.js'
import { generateCard } from '../services/cardGenerator.js'
import { generateSelected } from '../services/generationQueue.js'
import { addCards, getCards } from '../storage/localStore.js'

export default function useExtraction({ setCards, setError, setNotice }) {
  const [text, setText] = useState('')
  const [terms, setTerms] = useState([])
  const [phase, setPhase] = useState('idle')
  const busy = useRef(false)
  async function onExtract(source) {
    if (busy.current) return
    busy.current = true
    setPhase('extracting')
    setError('')
    setNotice('')
    setTerms([])
    try {
      const result = await extractTerms(source)
      setTerms(
        result.map((item) => ({ ...item, selected: true, status: 'ready' })),
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setPhase('idle')
      busy.current = false
    }
  }
  async function onGenerate(items) {
    if (busy.current || !items.length) return
    busy.current = true
    setPhase('generating')
    setError('')
    setNotice('')
    let added = 0,
      updated = 0,
      failed = 0
    try {
      await generateSelected(items, generateCard, (item, result) => {
        let { error, card } = result
        if (!error) {
          try {
            const before = getCards().length
            const saved = addCards([card])
            setCards(saved)
            if (saved.length > before) added++
            else updated++
          } catch (storageError) {
            error = storageError.message
          }
        }
        if (error) failed++
        setTerms((previous) =>
          previous.map((term) =>
            term.term === item.term
              ? { ...term, status: error ? 'error' : 'done', error, card }
              : term,
          ),
        )
      })
      setNotice(
        '新增 ' +
          added +
          ' 张 · 更新 ' +
          updated +
          ' 张' +
          (failed
            ? ' · 失败 ' + failed + ' 张，可在候选列表重试'
            : '，已保存到词库。'),
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setPhase('idle')
      busy.current = false
    }
  }
  function changeText(value) {
    if (busy.current) return
    setText(value)
    // Candidates belong to the previous text; never generate from stale context.
    setTerms([])
  }
  return { text, setText: changeText, terms, setTerms, phase, onExtract, onGenerate }
}
