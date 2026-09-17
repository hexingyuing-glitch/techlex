import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import QuizMode, { maskTerm } from './QuizMode.jsx'
import { sampleCard } from '../test/fixtures.js'

describe('finite review rounds', () => {
  it('excludes placeholders and ends after one answer per eligible card', async () => {
    const user = userEvent.setup()
    const review = vi.fn()
    render(
      <QuizMode
        cards={[
          sampleCard,
          { ...sampleCard, id: 'placeholder', contentSource: 'placeholder' },
        ]}
        onReview={review}
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByRole('progressbar')).toHaveAttribute('max', '1')
    await user.click(screen.getByRole('button', { name: /暂时想不起来/ }))
    expect(review).toHaveBeenCalledWith(sampleCard, false)
    await user.click(screen.getByRole('button', { name: '查看本轮总结' }))
    expect(
      screen.getByRole('heading', { name: '这一轮，完成了。' }),
    ).toBeInTheDocument()
    expect(screen.getByText('idempotent')).toBeInTheDocument()
    expect(review).toHaveBeenCalledTimes(1)
  })

  it('does not advance or report success when saving fails', async () => {
    const user = userEvent.setup()
    render(
      <QuizMode cards={[sampleCard]} onReview={() => false} onBack={vi.fn()} />,
    )
    await user.type(screen.getByLabelText('你的答案'), sampleCard.term)
    await user.click(screen.getByRole('button', { name: '检查答案' }))
    expect(screen.getByRole('alert')).toHaveTextContent('未保存')
    expect(screen.queryByText('回答正确')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '检查答案' })).toBeEnabled()
  })

  it('caps rounds at ten and never repeats a card in the round', async () => {
    const user = userEvent.setup()
    const review = vi.fn()
    const cards = Array.from({ length: 12 }, (_, index) => ({
      ...sampleCard,
      id: 'card-' + index,
      term: 'term-' + index,
    }))
    render(<QuizMode cards={cards} onReview={review} onBack={vi.fn()} />)
    for (let index = 0; index < 10; index++) {
      await user.click(screen.getByRole('button', { name: /暂时想不起来/ }))
      await user.click(
        screen.getByRole('button', {
          name: index === 9 ? '查看本轮总结' : '下一张',
        }),
      )
    }
    expect(new Set(review.mock.calls.map(([card]) => card.id)).size).toBe(10)
    expect(
      screen.getByRole('heading', { name: '这一轮，完成了。' }),
    ).toBeInTheDocument()
  })

  it('escapes regex punctuation when hiding answers', () => {
    expect(maskTerm('C++ uses C++.', 'C++')).toBe('________ uses ________.')
  })
})
