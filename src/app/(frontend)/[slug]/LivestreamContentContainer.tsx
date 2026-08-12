'use client'

import React, { useState } from 'react'
import ChatClient from './ChatClient'

interface LivestreamContentContainerProps {
  accessMode?: 'public' | 'password' | 'username' | null
  password?: string | null
  embedUrl: string
  streamTitle: string
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

export default function LivestreamContentContainer({
  accessMode,
  password,
  embedUrl,
  streamTitle,
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
}: LivestreamContentContainerProps): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !accessMode || accessMode === 'public'
  })
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [authUsername, setAuthUsername] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordInput.trim()) {
      setErrorMsg('Voer een wachtwoord in')
      return
    }
    if (passwordInput === password) {
      setIsAuthenticated(true)
      setErrorMsg('')
    } else {
      setErrorMsg('Onjuist wachtwoord. Probeer het opnieuw.')
    }
  }

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedUsername = usernameInput.trim()
    if (!trimmedUsername) {
      setErrorMsg('Voer een gebruikersnaam in')
      return
    }
    if (trimmedUsername.length < 2) {
      setErrorMsg('Gebruikersnaam moet minimaal 2 tekens bevatten')
      return
    }
    setAuthUsername(trimmedUsername)
    setIsAuthenticated(true)
    setErrorMsg('')
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
        <div className="w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl p-8 md:p-10 shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
          
          {/* Header Icon */}
          <div className="flex justify-center mb-6">
            <div 
              className="p-4 rounded-full flex items-center justify-center bg-white/60 shadow-inner"
              style={{ color: buttonColor }}
            >
              {accessMode === 'password' ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2 tracking-tight">
            {accessMode === 'password' ? 'Wachtwoord Vereist' : 'Gebruikersnaam Invoeren'}
          </h2>
          <p className="text-center text-sm opacity-80 mb-8">
            {accessMode === 'password' 
              ? 'Voer het wachtwoord in om toegang te krijgen tot de livestream.' 
              : 'Voer een gebruikersnaam in om deel te nemen aan de chat en de stream te bekijken.'}
          </p>

          {/* Form */}
          {accessMode === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-75">
                  Wachtwoord
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Voer wachtwoord in"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300/80 bg-white/70 focus:outline-none focus:ring-2 transition-all text-black"
                  style={{ '--tw-ring-color': buttonColor } as any}
                  required
                />
              </div>

              {errorMsg && (
                <div className="text-sm font-medium text-red-600 bg-red-50/80 border border-red-200/50 px-3 py-2 rounded-lg flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold transition-all shadow-lg hover:opacity-95 active:scale-[0.98] mt-2"
                style={{ backgroundColor: buttonColor, color: buttonTextColor }}
              >
                Stream Ontgrendelen
              </button>
            </form>
          ) : (
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-75">
                  Gebruikersnaam
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Kies een gebruikersnaam"
                  maxLength={30}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300/80 bg-white/70 focus:outline-none focus:ring-2 transition-all text-black"
                  style={{ '--tw-ring-color': buttonColor } as any}
                  required
                />
              </div>

              {errorMsg && (
                <div className="text-sm font-medium text-red-600 bg-red-50/80 border border-red-200/50 px-3 py-2 rounded-lg flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold transition-all shadow-lg hover:opacity-95 active:scale-[0.98] mt-2"
                style={{ backgroundColor: buttonColor, color: buttonTextColor }}
              >
                Deelnemen
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <iframe
        className="aspect-video mt-4 rounded-xl shadow-lg border border-white/20"
        width="100%"
        height="100%"
        src={embedUrl}
        title={streamTitle}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>

      <ChatClient
        chatRoomArn={chatRoomArn}
        chatEndpoint={chatEndpoint}
        websocketEndpoint={websocketEndpoint}
        placeholder={placeholder}
        buttonText={buttonText}
        instruction={instruction}
        successMessage={successMessage}
        errorMessage={errorMessage}
        buttonColor={buttonColor}
        buttonTextColor={buttonTextColor}
        toastSuccessColor={toastSuccessColor}
        toastErrorColor={toastErrorColor}
        initialUsername={authUsername || undefined}
      />
    </>
  )
}
