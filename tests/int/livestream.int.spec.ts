// @vitest-environment node
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('Livestreams Integration Tests', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('creates public livestream with default accessMode', async () => {
    const stream = await payload.create({
      collection: 'livestreams',
      data: {
        title: 'Public Test Stream',
        slug: 'public-test-stream',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        logoType: 'svg',
        logoSvg: '<svg></svg>',
      },
    })
    expect(stream.accessMode).toBe('public')

    // Cleanup
    await payload.delete({
      collection: 'livestreams',
      id: stream.id,
    })
  })

  it('requires password when accessMode is password', async () => {
    await expect(
      payload.create({
        collection: 'livestreams',
        data: {
          title: 'Password Test Stream',
          slug: 'password-test-stream',
          youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          logoType: 'svg',
          logoSvg: '<svg></svg>',
          accessMode: 'password',
        },
      })
    ).rejects.toThrow()
  })

  it('creates password livestream when password is provided', async () => {
    const stream = await payload.create({
      collection: 'livestreams',
      data: {
        title: 'Password Test Stream 2',
        slug: 'password-test-stream-2',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        logoType: 'svg',
        logoSvg: '<svg></svg>',
        accessMode: 'password',
        password: 'securePassword123',
      },
    })
    expect(stream.accessMode).toBe('password')
    expect(stream.password).toBe('securePassword123')

    // Cleanup
    await payload.delete({
      collection: 'livestreams',
      id: stream.id,
    })
  })

  it('creates username livestream', async () => {
    const stream = await payload.create({
      collection: 'livestreams',
      data: {
        title: 'Username Test Stream',
        slug: 'username-test-stream',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        logoType: 'svg',
        logoSvg: '<svg></svg>',
        accessMode: 'username',
      },
    })
    expect(stream.accessMode).toBe('username')

    // Cleanup
    await payload.delete({
      collection: 'livestreams',
      id: stream.id,
    })
  })

  it('normalizes mixed-case slug to lowercase on create', async () => {
    const stream = await payload.create({
      collection: 'livestreams',
      data: {
        title: 'Slug Normalization Test',
        slug: 'MyStream',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        logoType: 'svg',
        logoSvg: '<svg></svg>',
      },
    })
    expect(stream.slug).toBe('mystream')

    // Cleanup
    await payload.delete({
      collection: 'livestreams',
      id: stream.id,
    })
  })

  it('rejects duplicate slug regardless of casing', async () => {
    const stream = await payload.create({
      collection: 'livestreams',
      data: {
        title: 'Original Slug Test',
        slug: 'unique-slug-for-collision-test',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        logoType: 'svg',
        logoSvg: '<svg></svg>',
      },
    })

    await expect(
      payload.create({
        collection: 'livestreams',
        data: {
          title: 'Duplicate Slug Test',
          slug: 'Unique-Slug-For-Collision-Test',
          youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          logoType: 'svg',
          logoSvg: '<svg></svg>',
        },
      }),
    ).rejects.toThrow('Slug "unique-slug-for-collision-test" is already in use')

    // Cleanup
    await payload.delete({
      collection: 'livestreams',
      id: stream.id,
    })
  })

  it('trims and lowercases slug with surrounding whitespace', async () => {
    const stream = await payload.create({
      collection: 'livestreams',
      data: {
        title: 'Padded Slug Test',
        slug: '  Padded Slug  ',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        logoType: 'svg',
        logoSvg: '<svg></svg>',
      },
    })
    expect(stream.slug).toBe('padded slug')

    // Cleanup
    await payload.delete({
      collection: 'livestreams',
      id: stream.id,
    })
  })
})
