import React from 'react'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import type { Metadata } from 'next'
import config from '@/payload.config'
import type { Livestream, Media } from '@/payload-types'
import QrClient from './QrClient'

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
      title: 'Livestream niet gevonden',
    }
  }

  const stream = result.docs[0]
  return {
    title: `QR — ${stream.title}`,
    description: `QR code voor ${stream.title}`,
  }
}

const MAX_LOGO_BYTES = 256 * 1024 // 256 KB

async function fetchLogoDataUrl(logoImage: Media): Promise<string | null> {
  try {
    const url = logoImage.url
    if (!url) return null
    const absoluteUrl = url.startsWith('http') ? url : `https://live.studiosayyeah.nl${url}`
    const response = await fetch(absoluteUrl)
    if (!response.ok) return null
    const contentType = response.headers.get('content-type') || 'image/png'
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_LOGO_BYTES) return null

    const buffer = await response.arrayBuffer()
    if (buffer.byteLength > MAX_LOGO_BYTES) return null

    const base64 = Buffer.from(buffer).toString('base64')
    return `data:${contentType};base64,${base64}`
  } catch {
    return null
  }
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function QrPage(props: {
  params: Params
  searchParams: SearchParams
}): Promise<React.ReactNode> {
  const { slug } = await props.params
  const normalizedSlug = normalizeSlug(slug)

  const sp = await props.searchParams
  const showLogo = sp.logo !== '0'
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

  const stream = result.docs[0] as Livestream

  // Resolve theme colors with same defaults as viewer page
  const theme = stream.theme || {}
  const backgroundColor = theme.backgroundColor || '#e5f6fd'
  const textColor = theme.textColor || '#000000'

  const globalStyles = `
    html, body {
      background: ${backgroundColor} !important;
      color: ${textColor} !important;
    }
  `

  // Build logo data URL
  let logoDataUrl: string | null = null

  if (showLogo) {
    if (stream.logoType === 'svg' && stream.logoSvg) {
      logoDataUrl = `data:image/svg+xml;base64,${Buffer.from(stream.logoSvg).toString('base64')}`
    } else if (stream.logoType === 'image' && stream.logoImage) {
      const logoImg = stream.logoImage
      if (typeof logoImg === 'object' && logoImg !== null && 'url' in logoImg) {
        logoDataUrl = await fetchLogoDataUrl(logoImg as Media)
      }
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
            <h1 className="text-2xl font-bold mb-2">QR Code</h1>
            <p className="mb-6 opacity-70">Scan de QR code om de livestream te openen</p>

            <QrClient
              slug={normalizedSlug}
              logoDataUrl={logoDataUrl}
            />
          </div>
        </div>
      </div>
    </>
  )
}