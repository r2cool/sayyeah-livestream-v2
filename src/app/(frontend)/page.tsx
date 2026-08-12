import React from 'react'
import { redirect } from 'next/navigation'

export default function HomePage(): React.ReactNode {
  redirect('https://sayyeah.nl/')
}
