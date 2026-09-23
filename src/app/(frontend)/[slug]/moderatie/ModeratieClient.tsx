'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface HistoryMessage {
  username: string
  message: string
}

interface LiveMessage {
  id: number
  username: string
  content: string
}

interface ModeratieClientProps {
  slug: string
  streamTitle: string
  hasModerationPassword: boolean
  backgroundColor: string
  textColor: string
  buttonColor: string
  buttonTextColor: string
  chatRoomArn: string
  chatEndpoint: string
  websocketEndpoint: string
}

export default function ModeratieClient({
  slug,
  streamTitle,
  hasModerationPassword,
  backgroundColor,
  textColor,
  buttonColor,
  buttonTextColor,
  chatRoomArn,
  chatEndpoint,
  websocketEndpoint,
}: ModeratieClientProps): React.JSX.Element {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')
  const [historyMessages, setHistoryMessages] = useState<HistoryMessage[]>([])
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([])
  const [historyError, setHistoryError] = useState('')
  const [socketError, setSocketError] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)
  const wsRef = useRef<WebSocket | null>(null)
  const activeRef = useRef(true)
  const nextIdRef = useRef(0)

  // Track scroll position
  const handleScroll = useCallback(() => {
    const el = listRef.current
    if (!el) return
    const threshold = 50
    isAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  }, [])

  // Auto-scroll when new messages arrive if user is at bottom
  useEffect(() => {
    if (isAtBottomRef.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [liveMessages, historyMessages])

  // No password form needed when there's no moderation password configured
  if (!hasModerationPassword) {
    return (
      <div className="p-6 rounded-lg border border-red-300 bg-red-50/30 text-red-700">
        <p className="font-semibold text-lg">Geen moderatie wachtwoord geconfigureerd</p>
        <p className="mt-2">
          Deze livestream heeft geen moderatie wachtwoord. Neem contact op met de beheerder om
          toegang te krijgen tot de moderatie pagina.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setLoading(true)
    setAuthError('')
    setHistoryError('')
    setSocketError('')
    setHistoryMessages([])
    setLiveMessages([])

    try {
      const res = await fetch(`/${slug}/moderatie/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      })

      if (res.status === 401 || res.status === 403) {
        const data = (await res.json()) as { error?: string }
        setAuthError(data.error || 'Onjuist wachtwoord')
        setLoading(false)
        return
      }

      if (res.status === 502) {
        const data = (await res.json()) as { error?: string }
        setHistoryError(data.error || 'Kon chatgeschiedenis niet ophalen')
        // Still authenticate — the live socket may work
      }

      if (!res.ok) {
        setAuthError('Er is een fout opgetreden')
        setLoading(false)
        return
      }

      const data = (await res.json()) as { messages?: { username: string; message: string }[] }
      if (data.messages && Array.isArray(data.messages)) {
        setHistoryMessages(data.messages)
      }

      setAuthenticated(true)
      setLoading(false)
    } catch {
      setAuthError('Kan geen verbinding maken met de server')
      setLoading(false)
    }
  }

  // Connect WebSocket after authentication
  useEffect(() => {
    if (!authenticated) return

    activeRef.current = true
    const userId = `moderator-${Date.now()}`

    const connect = async () => {
      try {
        const jsonData = JSON.stringify({
          arn: chatRoomArn,
          userId,
          attributes: {
            stream_slug: slug,
            username: userId,
            avatar: 'undefined',
          },
          capabilities: ['SEND_MESSAGE'],
        })

        const res = await fetch(chatEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'insomnia/2023.5.8',
          },
          body: jsonData,
        })

        if (!activeRef.current) return

        const response = (await res.json()) as { token?: string }
        const token = response.token

        if (!token) {
          if (activeRef.current) {
            setSocketError('Kon geen chat token verkrijgen')
          }
          return
        }

        const ws = new WebSocket(websocketEndpoint, token)
        wsRef.current = ws

        ws.onopen = () => {
          if (!activeRef.current) {
            ws.close()
            return
          }
        }

        ws.onmessage = (event) => {
          if (!activeRef.current) return

          try {
            const data = JSON.parse(event.data)

            // Filter on type discriminator if present; only accept chat messages
            if (data.type && data.type !== 'MESSAGE') return

            // Defensively read content from the most likely fields
            const content =
              typeof data.content === 'string'
                ? data.content
                : typeof data.Content === 'string'
                  ? data.Content
                  : ''

            if (!content) return

            // Read display name from sender attributes, falling back to sender.userId
            const username =
              data.attributes?.username ||
              data.Attributes?.username ||
              data.Attributes?.Username ||
              data.sender?.userId ||
              data.Sender?.UserId ||
              'Onbekend'

            const id = nextIdRef.current++
            setLiveMessages((prev) => [...prev, { id, username, content }])
          } catch {
            // Malformed frame — skip it silently
          }
        }

        ws.onerror = () => {
          if (activeRef.current) {
            setSocketError('WebSocket verbinding mislukt')
          }
        }

        ws.onclose = () => {
          if (activeRef.current) {
            // Do not auto-reconnect per spec
          }
        }
      } catch {
        if (activeRef.current) {
          setSocketError('Kon geen chat token verkrijgen')
        }
      }
    }

    connect()

    return () => {
      activeRef.current = false
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [authenticated, chatRoomArn, chatEndpoint, websocketEndpoint, slug])

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="mod-password"
              className="block text-sm font-semibold mb-2"
              style={{ color: textColor }}
            >
              Moderatie Wachtwoord
            </label>
            <input
              id="mod-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Voer het moderatie wachtwoord in"
              className="w-full px-4 py-3 rounded-xl border border-gray-300/80 bg-white/70 focus:outline-none focus:ring-2 transition-all text-black"
              style={{ '--tw-ring-color': buttonColor } as React.CSSProperties}
              required
              autoFocus
            />
          </div>

          {authError && (
            <div className="text-sm font-medium text-red-600 bg-red-50/80 border border-red-200/50 px-3 py-2 rounded-lg">
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold transition-all shadow-lg hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: buttonColor, color: buttonTextColor }}
          >
            {loading ? 'Bezig met inloggen...' : 'Inloggen'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div>
      {/* Connection status */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{
            backgroundColor: socketError ? '#ef4444' : '#22c55e',
          }}
        />
        <span>{socketError ? 'Verbinding mislukt' : 'Live verbinding actief'}</span>
      </div>

      {/* Socket error banner */}
      {socketError && (
        <div className="mb-4 p-3 rounded-lg border border-red-300 bg-red-50/30 text-red-700 text-sm">
          {socketError}
        </div>
      )}

      {/* History error banner */}
      {historyError && (
        <div className="mb-4 p-3 rounded-lg border border-amber-300 bg-amber-50/30 text-amber-700 text-sm">
          {historyError} — Live berichten worden wel weergegeven.
        </div>
      )}

      {/* Message list */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="border border-gray-300/60 rounded-xl bg-white/30 overflow-y-auto"
        style={{ maxHeight: '70vh', minHeight: '300px' }}
      >
        {/* History messages */}
        {historyMessages.length > 0 && (
          <div className="px-4 pt-3 pb-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2">
              Geschiedenis ({historyMessages.length} berichten)
            </h2>
            {historyMessages.map((msg, i) => (
              <div
                key={`hist-${i}`}
                className="py-1.5 border-b border-gray-200/40 last:border-b-0"
              >
                <span className="font-semibold text-sm opacity-80">{msg.username}</span>
                <span className="ml-2 text-sm">{msg.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Separator between history and live */}
        {historyMessages.length > 0 && liveMessages.length > 0 && (
          <div className="px-4 py-1">
            <div className="border-t border-gray-400/30 my-1" />
          </div>
        )}

        {/* Live messages */}
        {liveMessages.length > 0 && (
          <div className="px-4 pt-1 pb-3">
            {historyMessages.length > 0 && (
              <h2 className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2">
                Live ({liveMessages.length} berichten)
              </h2>
            )}
            {liveMessages.map((msg) => (
              <div
                key={msg.id}
                className="py-1.5 border-b border-gray-200/40 last:border-b-0"
              >
                <span className="font-semibold text-sm opacity-80">{msg.username}</span>
                <span className="ml-2 text-sm">{msg.content}</span>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {historyMessages.length === 0 && liveMessages.length === 0 && (
          <div className="flex items-center justify-center h-48 text-sm opacity-50">
            {historyError
              ? 'Geschiedenis kon niet worden geladen. Wacht op live berichten...'
              : 'Geen berichten ontvangen. Wacht op live berichten...'}
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="mt-4 text-xs opacity-50 text-center">
        Alleen-lezen moderatie paneel — {streamTitle}
      </div>
    </div>
  )
}