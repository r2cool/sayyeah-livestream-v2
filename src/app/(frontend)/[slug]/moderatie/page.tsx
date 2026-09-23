import React from 'react'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Script from 'next/script'
import type { Metadata } from 'next'
import config from '@/payload.config'
import type { Livestream } from '@/payload-types'
import ModeratieClient from './ModeratieClient'

type Params = Promise<{ slug: string }>

const normalizeSlug = (value: string): string => value.trim().toLowerCase()

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { slug } = await props.params
  const normalizedSlug = normalizeSlug(slug)
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'livestreams',
    where: {
      slug: {
        equals: normalizedSlug,
      },
    },
  })

  if (result.docs.length === 0) {
    return {
      title: 'Moderatie niet gevonden',
    }
  }

  const stream = result.docs[0]
  return {
    title: `Moderatie — ${stream.title}`,
    description: `Moderation panel for ${stream.title}`,
  }
}

export default async function ModeratiePage(props: { params: Params }): Promise<React.ReactNode> {
  const { slug } = await props.params
  const normalizedSlug = normalizeSlug(slug)
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'livestreams',
    where: {
      slug: {
        equals: normalizedSlug,
      },
    },
  })

  if (result.docs.length === 0) {
    return notFound()
  }

  const stream = result.docs[0] as Livestream & { moderationPassword?: string | null }

  // Resolve theme colors with same defaults as viewer page
  const theme = stream.theme || {}
  const backgroundColor = theme.backgroundColor || '#e5f6fd'
  const textColor = theme.textColor || '#000000'
  const buttonColor = theme.buttonColor || '#00AEEF'
  const buttonTextColor = theme.buttonTextColor || '#ffffff'

  const hasModerationPassword = Boolean(stream.moderationPassword)

  const globalStyles = `
    html, body {
      background: ${backgroundColor} !important;
      color: ${textColor} !important;
    }
  `

  // Parse Logo — same pattern as the viewer page
  let logoHtml: React.ReactNode = null
  if (stream.logoType === 'svg' && stream.logoSvg) {
    logoHtml = (
      <div dangerouslySetInnerHTML={{ __html: stream.logoSvg }} style={{ fill: textColor }} />
    )
  } else if (stream.logoType === 'image' && stream.logoImage) {
    const logoImg: any = stream.logoImage
    if (typeof logoImg === 'object' && logoImg.url) {
      logoHtml = (
        <Image
          src={logoImg.url}
          alt={logoImg.alt || 'Logo'}
          width={logoImg.width || 150}
          height={logoImg.height || 40}
          style={{ objectFit: 'contain', maxHeight: '80px', width: 'auto' }}
        />
      )
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />

      <div
        style={{ background: backgroundColor, color: textColor, minHeight: '100vh', width: '100%' }}
      >
        <div className="container mx-auto max-w-screen-lg pb-12">
          <div className="p-4 md:p-0 mx-auto max-w-screen-lg relative">
            <div className="mt-8 mb-4 flex items-center justify-between">
              {logoHtml}
              <span className="text-xs opacity-50">Moderatie paneel</span>
            </div>
            <h1 className="text-2xl font-bold mb-4">
              Moderatie — {stream.title}
            </h1>

            <ModeratieClient
              slug={normalizedSlug}
              streamTitle={stream.title}
              hasModerationPassword={hasModerationPassword}
              backgroundColor={backgroundColor}
              textColor={textColor}
              buttonColor={buttonColor}
              buttonTextColor={buttonTextColor}
              chatRoomArn={stream.chat?.chatRoomArn || ''}
              chatEndpoint={stream.chat?.chatEndpoint || ''}
              websocketEndpoint={stream.chat?.websocketEndpoint || ''}
            />
          </div>
        </div>
      </div>
    </>
  )
}