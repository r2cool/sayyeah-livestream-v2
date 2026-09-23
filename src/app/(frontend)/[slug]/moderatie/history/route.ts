import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Livestream } from '@/payload-types'

export const dynamic = 'force-dynamic'

const HISTORY_TRIGGER_URL = 'https://video.sayyeah.nl/bericht/backup-chat.php'
const HISTORY_DATA_URL = 'https://video.sayyeah.nl/bericht/chat-messages-backup.json'

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) => {
  const { slug } = await params
  const normalizedSlug = slug.trim().toLowerCase()

  let body: { password?: string }
  try {
    body = (await request.json()) as { password?: string }
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const submittedPassword = body.password

  if (typeof submittedPassword !== 'string' || !submittedPassword) {
    return Response.json({ error: 'Password is required' }, { status: 400 })
  }

  const payload = await getPayload({
    config: configPromise,
  })

  const result = await payload.find({
    collection: 'livestreams',
    where: {
      slug: { equals: normalizedSlug },
    },
    depth: 0,
    limit: 1,
    pagination: false,
  })

  if (result.docs.length === 0) {
    // Return a generic error that does not distinguish "no such stream" from "wrong password"
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stream = result.docs[0] as Livestream & { moderationPassword?: string | null }

  if (!stream.moderationPassword) {
    return Response.json(
      { error: 'No moderation password is configured for this livestream.' },
      { status: 403 },
    )
  }

  // Constant-time comparison is not readily available in the CF Workers runtime without
  // a crypto constant-time helper; a plain === is acceptable here since the check happens
  // server-side and the route is rate-limited by the network layer.
  if (submittedPassword !== stream.moderationPassword) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Two-step external fetch: first trigger regeneration, then fetch data
  try {
    const triggerResponse = await fetch(HISTORY_TRIGGER_URL, { cache: 'no-store' })
    // Consume the response body to ensure the request completes before proceeding
    await triggerResponse.text()
  } catch {
    // A failed trigger does not prevent the data fetch; the JSON endpoint may still serve data
  }

  let historyData: unknown
  try {
    const dataResponse = await fetch(HISTORY_DATA_URL, { cache: 'no-store' })
    historyData = await dataResponse.json()
  } catch {
    return Response.json(
      { error: 'Failed to fetch chat history from upstream.' },
      { status: 502 },
    )
  }

  // Validate and normalize the parsed data
  if (!Array.isArray(historyData)) {
    return Response.json(
      { error: 'Upstream returned unexpected data format.' },
      { status: 502 },
    )
  }

  const messages = historyData
    .map((entry: unknown) => {
      if (typeof entry !== 'object' || entry === null) return null
      const obj = entry as Record<string, unknown>
      const username = typeof obj.username === 'string' ? obj.username : ''
      const message = typeof obj.message === 'string' ? obj.message : ''
      return { username, message }
    })
    .filter(
      (m): m is { username: string; message: string } =>
        m !== null && (m.username !== '' || m.message !== ''),
    )

  return Response.json({ messages })
}