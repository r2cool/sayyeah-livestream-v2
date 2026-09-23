'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import QRCode from 'qrcode'

interface QrClientProps {
  slug: string
  logoDataUrl: string | null
}

const QR_URL = 'https://live.studiosayyeh.nl'
const LOGO_MAX_WIDTH_FRACTION = 0.25

export default function QrClient({ slug, logoDataUrl }: QrClientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [svgString, setSvgString] = useState<string | null>(null)
  const [qrSize, setQrSize] = useState<number>(0)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const qrValue = `${QR_URL}/${slug}`

  const generateQr = useCallback(async () => {
    setError(null)

    try {
      // --- SVG path (always generated, used for SVG download) ---
      const svg = await QRCode.toString(qrValue, {
        type: 'svg',
        errorCorrectionLevel: 'H',
      })
      let finalSvg = svg

      if (logoDataUrl) {
        // Inject logo into SVG as <image>
        const viewBoxMatch = svg.match(/viewBox="([^"]+)"/)
        const svgWidthMatch = svg.match(/width="([^"]+)"/)
        const svgHeightMatch = svg.match(/height="([^"]+)"/)
        let svgW = 0
        let svgH = 0

        if (viewBoxMatch) {
          const parts = viewBoxMatch[1].split(/\s+/)
          svgW = parseFloat(parts[2])
          svgH = parseFloat(parts[3])
        } else if (svgWidthMatch && svgHeightMatch) {
          svgW = parseFloat(svgWidthMatch[1])
          svgH = parseFloat(svgHeightMatch[1])
        }

        if (svgW > 0 && svgH > 0) {
          const logoMaxW = svgW * LOGO_MAX_WIDTH_FRACTION
          const logoMaxH = svgH * LOGO_MAX_WIDTH_FRACTION
          const logoW = Math.min(logoMaxW, logoMaxH)
          const logoH = logoW // square logo
          const logoX = (svgW - logoW) / 2
          const logoY = (svgH - logoH) / 2

          const logoImageTag = `<image href="${logoDataUrl}" x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" preserveAspectRatio="xMidYMid meet" />`

          // Insert before closing </svg>
          finalSvg = svg.replace('</svg>', `${logoImageTag}</svg>`)
        }
      }

      setSvgString(finalSvg)

      // --- Canvas path (for display and PNG download) ---
      const canvas = canvasRef.current
      if (!canvas) return

      // Render QR code to canvas first
      await QRCode.toCanvas(canvas, qrValue, {
        errorCorrectionLevel: 'H',
        width: 400,
      })

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const size = canvas.width
      setQrSize(size)

      if (logoDataUrl) {
        const logoMaxDim = size * LOGO_MAX_WIDTH_FRACTION
        const logoImg = new Image()

        await new Promise<void>((resolve) => {
          logoImg.onload = () => {
            let logoW = logoImg.naturalWidth
            let logoH = logoImg.naturalHeight

            // Scale down if larger than cap
            if (logoW > logoMaxDim || logoH > logoMaxDim) {
              const scale = Math.min(logoMaxDim / logoW, logoMaxDim / logoH)
              logoW = Math.floor(logoW * scale)
              logoH = Math.floor(logoH * scale)
            }

            const logoX = (size - logoW) / 2
            const logoY = (size - logoH) / 2

            ctx.drawImage(logoImg, logoX, logoY, logoW, logoH)
            resolve()
          }
          logoImg.onerror = () => {
            // Logo failed to load, just skip it
            resolve()
          }
          logoImg.src = logoDataUrl
        })
      }

      setQrDataUrl(canvas.toDataURL('image/png'))
      setReady(true)
    } catch (err) {
      console.error('QR generation failed:', err)
      setError('QR code kon niet worden gegenereerd.')
    }
  }, [qrValue, logoDataUrl])

  useEffect(() => {
    generateQr()
  }, [generateQr])

  const downloadPng = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slug}-qr.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [slug])

  const downloadSvg = useCallback(() => {
    if (!svgString) return
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}-qr.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [slug, svgString])

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Hidden canvas used for QR rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Display the QR from the generated data URL */}
      {qrDataUrl && (
        <img
          src={qrDataUrl}
          alt={`QR code voor ${slug}`}
          className="max-w-full h-auto"
          style={{ width: qrSize > 0 ? Math.min(qrSize, 400) : 400 }}
        />
      )}

      {!ready && !error && <p className="opacity-50">QR code wordt gegenereerd...</p>}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={downloadPng}
          disabled={!ready}
          className="px-6 py-2 rounded font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: '#00AEEF', color: '#ffffff' }}
        >
          Download PNG
        </button>
        <button
          type="button"
          onClick={downloadSvg}
          disabled={!ready}
          className="px-6 py-2 rounded font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: '#00AEEF', color: '#ffffff' }}
        >
          Download SVG
        </button>
      </div>
    </div>
  )
}