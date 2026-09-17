import { beforeEach, describe, expect, it } from 'vitest'
import { addCards, getCards, parseBackup, STORAGE_KEY } from './localStore.js'
import { sampleCard } from '../test/fixtures.js'

beforeEach(() => localStorage.clear())

describe('backup and legacy compatibility', () => {
  it('labels old cards unknown without changing IDs or review records', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ ...sampleCard, correctCount: 8 }]),
    )
    expect(getCards()[0]).toMatchObject({
      id: sampleCard.id,
      correctCount: 8,
      contentSource: 'unknown',
    })
  })
  it('rejects unsupported versions and any malformed card atomically', () => {
    expect(() =>
      parseBackup('{"format":"techlex","version":2,"cards":[]}'),
    ).toThrow('版本')
    expect(() =>
      parseBackup(JSON.stringify([sampleCard, { term: 'invalid' }])),
    ).toThrow('第 2 张')
    expect(() => parseBackup('{broken')).toThrow('有效的 JSON')
    expect(() =>
      parseBackup(JSON.stringify([{ ...sampleCard, example: {} }])),
    ).toThrow('字段格式')
  })
  it('roundtrips content, creates fresh identities and sanitizes review metadata', () => {
    const parsed = parseBackup(
      JSON.stringify({
        format: 'techlex',
        version: 1,
        cards: [
          {
            ...sampleCard,
            contentSource: 'demo',
            reviewWeight: -3,
            wrongCount: 'Infinity',
          },
        ],
      }),
    )
    expect(parsed[0].id).not.toBe(sampleCard.id)
    expect(parsed[0]).toMatchObject({
      term: sampleCard.term,
      contentSource: 'demo',
      reviewWeight: 0.25,
      wrongCount: 0,
    })
  })
  it('does not create duplicate cards within one batch', () => {
    addCards([sampleCard, { ...sampleCard, id: 'duplicate' }])
    expect(getCards()).toHaveLength(1)
  })
})
