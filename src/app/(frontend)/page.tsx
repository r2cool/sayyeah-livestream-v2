import React from 'react'
import { useEffect } from 'react'

export default function HomePage(): React.ReactNode {
  useEffect(() => {
    window.location.href = 'https://sayyeah.nl/'
  }, [])

  return <p>Redirecting...</p>
}
