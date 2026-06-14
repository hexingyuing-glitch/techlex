import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CardList from './CardList.jsx'
import InputPanel from './InputPanel.jsx'
import QuizMode from './QuizMode.jsx'
import { sampleCard } from '../test/fixtures.js'

describe('main components', () => {
  it('validates empty source text', async () => {
    const user = userEvent.setup()
    render(<InputPanel onSubmit={vi.fn()} isLoading={false} />)
    await user.click(screen.getByRole('button', { name: /提取术语/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('请先粘贴')
  })

  it('renders empty cards and deletes a rendered card', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const { rerender } = render(<CardList cards={[]} onDelete={onDelete} />)
    expect(screen.getByText('卡片库还是空的')).toBeInTheDocument()

    rerender(<CardList cards={[sampleCard]} onDelete={onDelete} />)
    expect(screen.getByText('重复执行时产生相同结果。')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /删除术语/ }))
    expect(onDelete).toHaveBeenCalledWith(sampleCard.id)
  })

  it('submits a normalized correct quiz answer once', async () => {
    const user = userEvent.setup()
    const onReview = vi.fn()
    render(
      <QuizMode cards={[sampleCard]} onReview={onReview} onBack={vi.fn()} />,
    )

    expect(
      screen.getByText('The endpoint is ________ and safe to retry.'),
    ).toBeInTheDocument()
    await user.type(screen.getByLabelText('YOUR ANSWER'), ' Idempotent ')
    await user.click(screen.getByRole('button', { name: '检查答案' }))

    expect(onReview).toHaveBeenCalledWith(sampleCard, true)
    expect(screen.getByText('回答正确')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '检查答案' })).toBeDisabled()
  })
})
