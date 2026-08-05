'use client'

import React, { useState, useEffect, useRef } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    chatConnection?: WebSocket
    Toastify?: any
  }
}

interface ChatClientProps {
  chatRoomArn: string
  chatEndpoint: string
  websocketEndpoint: string
  placeholder: string
  buttonText: string
  instruction: string
  successMessage: string
  errorMessage: string
  buttonColor: string
  buttonTextColor: string
  toastSuccessColor: string
  toastErrorColor: string
}

export default function ChatClient({
  chatRoomArn,
  chatEndpoint,
  websocketEndpoint,
  placeholder,
  buttonText,
  instruction,
  successMessage,
  errorMessage,
  buttonColor,
  buttonTextColor,
  toastSuccessColor,
  toastErrorColor,
}: ChatClientProps): React.JSX.Element {
  const [msg, setMsg] = useState('')
  const [username] = useState(() => `${new Date().getTime()}`)
  const connectionRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    let active = true

    const initChat = () => {
      const jsonData = JSON.stringify({
        arn: chatRoomArn,
        userId: username,
        attributes: {
          username: username,
          avatar: 'undefined',
        },
        capabilities: ['SEND_MESSAGE'],
      })
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'insomnia/2023.5.8',
        },
        body: jsonData,
      }

      fetch(chatEndpoint, options)
        .then((response) => response.json())
        .then((response: any) => {
          if (!active) return
          const token = response.token
          const ws = new WebSocket(websocketEndpoint, token)
          connectionRef.current = ws
          window.chatConnection = ws
          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data)
              // Messages can be parsed here if a future message log is added
            } catch (e) {
              console.error(e)
            }
          }
        })
        .catch((err) => {
          console.error('Failed to authenticate chat:', err)
        })
    }

    initChat()

    return () => {
      active = false
      if (connectionRef.current) {
        connectionRef.current.close()
      }
    }
  }, [chatRoomArn, chatEndpoint, websocketEndpoint, username])

  const showToast = (text: string, bgColor: string) => {
    if (window.Toastify) {
      window.Toastify({
        text,
        duration: bgColor === toastErrorColor ? 5000 : 2000,
        close: false,
        gravity: 'bottom',
        position: 'center',
        stopOnFocus: false,
        style: {
          background: bgColor,
        },
      }).showToast()
    } else {
      alert(text)
    }
  }

  const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return html
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  }

  const handleSend = () => {
    if (!msg.trim()) return
    const ws = connectionRef.current
    const isOpen = ws && ws.readyState === ws.OPEN

    const payload = {
      action: 'SEND_MESSAGE',
      content: stripHtml(msg),
      attributes: {
        username: username,
      },
    }

    try {
      if (!isOpen) {
        showToast(errorMessage, toastErrorColor)
      } else {
        ws.send(JSON.stringify(payload))
        showToast(successMessage, toastSuccessColor)
        setMsg('')
      }
    } catch (e) {
      showToast(errorMessage, toastErrorColor)
      console.error(e)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <>
      <link
        rel="stylesheet"
        type="text/css"
        href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css"
      />
      <Script src="https://cdn.jsdelivr.net/npm/toastify-js" strategy="afterInteractive" />

      <div className="p-12 md:p-0 mx-auto max-w-screen-lg relative">
        <div>
          <div className="relative w-full">
            <input
              type="text"
              id="vraag"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyPress={handleKeyPress}
              className="block p-2.5 w-full z-20 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#000000', borderRadius: '0.375rem' }}
              placeholder={placeholder}
              required
            />
            <button
              type="button"
              id="submit-chat"
              onClick={handleSend}
              className="absolute top-0 end-0 p-2.5 h-full text-sm font-medium text-white hover:opacity-90 focus:ring-4 focus:outline-none focus:ring-blue-300"
              style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
                borderTopRightRadius: '0.375rem',
                borderBottomRightRadius: '0.375rem',
              }}
            >
              {buttonText}
            </button>
          </div>
          <div className="relative w-full" style={{ fontSize: '19px', marginTop: '8px' }}>
            {instruction}
          </div>
        </div>
      </div>
    </>
  )
}
