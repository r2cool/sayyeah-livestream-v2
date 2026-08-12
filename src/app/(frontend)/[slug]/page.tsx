import React from 'react'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Script from 'next/script'
import type { Metadata } from 'next'
import config from '@/payload.config'
import LivestreamContentContainer from './LivestreamContentContainer'

type Params = Promise<{ slug: string }>

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { slug } = await props.params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'livestreams',
    where: {
      slug: {
        equals: slug,
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
    title: stream.title,
    description: `Bekijk de livestream: ${stream.title}`,
  }
}

function getYoutubeEmbedUrl(urlOrId: string): string {
  if (!urlOrId) return ''
  if (urlOrId.includes('youtube.com/embed/')) {
    return urlOrId
  }
  let videoId = ''
  try {
    const url = new URL(urlOrId)
    if (url.hostname.includes('youtube.com')) {
      videoId = url.searchParams.get('v') || ''
    } else if (url.hostname.includes('youtu.be')) {
      videoId = url.pathname.slice(1)
    }
  } catch (e) {
    videoId = urlOrId
  }
  if (!videoId) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = urlOrId.match(regExp)
    videoId = match && match[2].length === 11 ? match[2] : urlOrId
  }
  return `https://www.youtube.com/embed/${videoId}?si=HFR4tI7UnMP2ZOjM`
}

export default async function LivestreamPage(props: { params: Params }): Promise<React.ReactNode> {
  const { slug } = await props.params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'livestreams',
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  if (result.docs.length === 0) {
    return notFound()
  }

  const stream = result.docs[0]

  // Setup Theme Styles
  const theme = stream.theme || {}
  const font = theme.font || 'system-ui'
  const customFont = theme.customFontName
  const backgroundColor = theme.backgroundColor || '#e5f6fd'
  const textColor = theme.textColor || '#000000'
  const buttonColor = theme.buttonColor || '#00AEEF'
  const buttonTextColor = theme.buttonTextColor || '#ffffff'

  let fontUrl = ''
  let globalStyles = `
    html, body {
      background: ${backgroundColor} !important;
      color: ${textColor} !important;
    }
  `

  if (font !== 'system-ui') {
    const fontName = font === 'custom' ? customFont : font
    if (fontName) {
      const encodedFont = encodeURIComponent(fontName)
      fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;500;700&display=swap`
      globalStyles += `body, input, button { font-family: '${fontName}', sans-serif !important; }`
    }
  }

  const embedUrl = getYoutubeEmbedUrl(stream.youtubeUrl)

  // Parse Logo
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
          style={{ objectFit: 'contain', maxHeight: '40px', width: 'auto' }}
        />
      )
    }
  }

  return (
    <>
      {fontUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href={fontUrl} rel="stylesheet" />
        </>
      )}
      {globalStyles && <style dangerouslySetInnerHTML={{ __html: globalStyles }} />}
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />

      <div
        style={{ background: backgroundColor, color: textColor, minHeight: '100vh', width: '100%' }}
      >
        <div className="container mx-auto max-w-screen-lg pb-12">
          <div className="p-12 md:p-0 mx-auto max-w-screen-lg relative">
            <div className="mt-8 mb-4 flex items-center justify-between">{logoHtml}</div>
            <LivestreamContentContainer
              accessMode={stream.accessMode as any}
              password={stream.password}
              embedUrl={embedUrl}
              streamTitle={stream.title}
              chatRoomArn={stream.chat?.chatRoomArn || ''}
              chatEndpoint={stream.chat?.chatEndpoint || ''}
              websocketEndpoint={stream.chat?.websocketEndpoint || ''}
              placeholder={stream.text?.placeholder || ''}
              buttonText={stream.text?.buttonText || ''}
              instruction={stream.text?.instruction || ''}
              successMessage={stream.text?.successMessage || ''}
              errorMessage={stream.text?.errorMessage || ''}
              buttonColor={buttonColor}
              buttonTextColor={buttonTextColor}
              toastSuccessColor={stream.text?.toastSuccessColor || ''}
              toastErrorColor={stream.text?.toastErrorColor || ''}
              title_username_form={stream.text_username_form?.title || ''}
              instruction_username_form={stream.text_username_form?.instruction || ''}
              label_username_form={stream.text_username_form?.labelText || ''}
              placeholder_username_form={stream.text_username_form?.placeholder || ''}
              buttonText_username_form={stream.text_username_form?.buttonText || ''}
              title_password_form={stream.text_password_form?.title || ''}
              instruction_password_form={stream.text_password_form?.instruction || ''}
              label_password_form={stream.text_password_form?.labelText || ''}
              placeholder_password_form={stream.text_password_form?.placeholder || ''}
              buttonText_password_form={stream.text_password_form?.buttonText || ''}
              errorText_password_form={stream.text_password_form?.errorMessage || ''}
            />
          </div>
        </div>
      </div>
    </>
  )
}
