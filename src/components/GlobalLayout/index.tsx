import React from 'react'
import { Header } from '@/Header/Component'
import { Footer } from '@/Footer/Component'

export const GlobalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  )
}
