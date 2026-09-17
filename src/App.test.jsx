import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'
import { extractTerms } from './services/termExtractor.js'
import { generateCard } from './services/cardGenerator.js'
import { getCards, STORAGE_KEY } from './storage/localStore.js'
import { sampleCard } from './test/fixtures.js'

vi.mock('./services/termExtractor.js', () => ({ extractTerms: vi.fn() }))
vi.mock('./services/cardGenerator.js', () => ({ generateCard: vi.fn() }))

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, '', '/')
  vi.clearAllMocks()
})

describe('workspace workflows', () => {
  it('discards stale candidates when the source text changes', async () => {
    const user = userEvent.setup()
    extractTerms.mockResolvedValue([
      { term: 'idempotent', context_sentence: 'PUT requests should be idempotent.' },
    ])
    render(<App />)
    await user.click(screen.getByRole('button', { name: '试试示例文本' }))
    await user.click(screen.getByRole('button', { name: '提取术语' }))
    await screen.findByRole('checkbox', { name: /idempotent/ })
    await user.type(screen.getByLabelText('英文技术文本'), ' A different context.')
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /生成所选卡片/ })).not.toBeInTheDocument()
    expect(generateCard).not.toHaveBeenCalled()
  })

  it('selects terms, saves only the selection, searches, edits, deletes and restores', async () => {
    const user = userEvent.setup()
    extractTerms.mockResolvedValue([
      {
        term: 'idempotent',
        context_sentence: 'PUT requests should be idempotent.',
      },
      {
        term: 'rate limiting',
        context_sentence: 'Rate limiting protects the API.',
      },
    ])
    generateCard.mockResolvedValue({ ...sampleCard, contentSource: 'demo' })
    render(<App />)
    await user.click(screen.getByRole('button', { name: '试试示例文本' }))
    await user.click(screen.getByRole('button', { name: '提取术语' }))
    await screen.findByRole('checkbox', { name: /rate limiting/ })
    await user.click(screen.getByRole('checkbox', { name: /rate limiting/ }))
    await user.click(screen.getByRole('button', { name: '生成所选卡片 · 1' }))
    await screen.findByText(/新增 1 张/)
    expect(generateCard).toHaveBeenCalledTimes(1)
    expect(getCards()).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: '前往词库 →' }))
    await user.type(screen.getByRole('textbox', { name: '搜索词库' }), '不存在')
    expect(screen.getByText('没有找到匹配的表达')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '清除筛选' }))
    await user.click(
      screen.getByRole('button', { name: '编辑术语 idempotent' }),
    )
    await user.clear(screen.getByLabelText('中文含义'))
    await user.type(screen.getByLabelText('中文含义'), '幂等操作（已修订）')
    await user.click(screen.getByRole('button', { name: '保存修改' }))
    expect(getCards()[0].translation).toBe('幂等操作（已修订）')
    await user.click(
      screen.getByRole('button', { name: '删除术语 idempotent' }),
    )
    expect(getCards()).toHaveLength(0)
    await user.click(screen.getByRole('button', { name: '撤销删除' }))
    expect(getCards()[0].translation).toBe('幂等操作（已修订）')
    expect(getCards()[0].id).toBe(sampleCard.id)
  })

  it('retains successful cards and retries only a failed candidate', async () => {
    const user = userEvent.setup()
    extractTerms.mockResolvedValue([
      {
        term: 'idempotent',
        context_sentence: 'PUT requests should be idempotent.',
      },
      { term: 'retry', context_sentence: 'Retry after a failure.' },
    ])
    generateCard.mockImplementation(async (term) => {
      if (term === 'retry') throw new Error('请求超时')
      return sampleCard
    })
    render(<App />)
    await user.click(screen.getByRole('button', { name: '试试示例文本' }))
    await user.click(screen.getByRole('button', { name: '提取术语' }))
    await user.click(
      await screen.findByRole('button', { name: '生成所选卡片 · 2' }),
    )
    await screen.findByText(/失败 1 张/)
    expect(getCards()).toHaveLength(1)
    generateCard.mockResolvedValue({
      ...sampleCard,
      id: 'retry-card',
      term: 'retry',
      sourceSentence: 'Retry after a failure.',
    })
    await user.click(screen.getByRole('button', { name: '重试', exact: true }))
    await waitFor(() => expect(getCards()).toHaveLength(2))
    expect(generateCard).toHaveBeenCalledTimes(3)
    expect(generateCard.mock.calls[2][0]).toBe('retry')
  })

  it('imports a validated backup without overwriting existing review history', async () => {
    const user = userEvent.setup()
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ ...sampleCard, correctCount: 7 }]),
    )
    window.history.replaceState(null, '', '/#library')
    render(<App />)
    const backup = JSON.stringify({
      format: 'techlex',
      version: 1,
      cards: [
        { ...sampleCard, correctCount: 0 },
        { ...sampleCard, term: 'new expression', id: sampleCard.id },
      ],
    })
    const file = { size: backup.length, text: async () => backup }
    fireEvent.change(screen.getByLabelText('选择备份文件'), {
      target: { files: [file] },
    })
    await screen.findByText(/导入 1 张，跳过 1 张/)
    expect(
      getCards().find((c) => c.term === sampleCard.term).correctCount,
    ).toBe(7)
    expect(new Set(getCards().map((c) => c.id)).size).toBe(2)
    await user.click(
      within(screen.getByRole('navigation', { name: '主导航' })).getByRole(
        'button',
        { name: /今日复习/ },
      ),
    )
    expect(screen.getByRole('progressbar')).toHaveAttribute('max', '2')
  })

  it('preserves malformed storage and blocks generation from overwriting it', async () => {
    const user = userEvent.setup()
    localStorage.setItem(STORAGE_KEY, '{damaged')
    extractTerms.mockResolvedValue([
      {
        term: 'idempotent',
        context_sentence: 'PUT requests should be idempotent.',
      },
    ])
    generateCard.mockResolvedValue(sampleCard)
    render(<App />)
    expect(screen.getByRole('alert')).toHaveTextContent('原数据仍被保留')
    await user.click(screen.getByRole('button', { name: '试试示例文本' }))
    await user.click(screen.getByRole('button', { name: '提取术语' }))
    await user.click(
      await screen.findByRole('button', { name: '生成所选卡片 · 1' }),
    )
    await screen.findByText(/失败 1 张/)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{damaged')
  })
})
