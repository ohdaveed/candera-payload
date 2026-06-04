import type { Metadata } from 'next'
import React from 'react'
import { Eyebrow } from '@/components/ui/eyebrow'

export const metadata: Metadata = {
  title: 'Contact — Candera',
  description: 'Reach out to Candera Studio for inquiries, wholesale, or just to share a moment of ritual.',
}

export default function ContactPage() {
  return (
    <div className="pt-32 pb-32 bg-candera-linen min-h-screen">
      <div className="container">
        <div className="max-w-[800px] mx-auto">
          <Eyebrow className="block mb-4 text-center">Get in Touch</Eyebrow>
          <h1 className="hero-heading text-candera-obsidian text-center mb-12">
            Connect with the Studio
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-20">
            <div>
              <h2 className="font-display text-2xl mb-6">Inquiries</h2>
              <p className="editorial text-candera-sage-text leading-relaxed mb-8">
                For questions regarding your order, wholesale opportunities, or press inquiries, please reach out to us. We strive to respond within 48 hours, though we favor a slower pace in the studio.
              </p>
              
              <div className="flex flex-col gap-4">
                <div>
                  <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-candera-sage-text block mb-1">
                    Email
                  </span>
                  <a href="mailto:studio@canderacandles.com" className="font-sans text-lg text-candera-obsidian hover:text-candera-ember-strong transition-colors">
                    studio@canderacandles.com
                  </a>
                </div>
                
                <div>
                  <span className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-candera-sage-text block mb-1">
                    Social
                  </span>
                  <a href="https://instagram.com/canderacandles" target="_blank" rel="noopener noreferrer" className="font-sans text-lg text-candera-obsidian hover:text-candera-ember-strong transition-colors">
                    @canderacandles
                  </a>
                </div>
              </div>
            </div>
            
            <div className="bg-candera-vellum/50 p-10 border border-candera-stone/20 rounded-sm">
              <h2 className="font-display text-2xl mb-6">Send a Note</h2>
              <p className="editorial text-sm text-candera-sage-text mb-8">
                The contact form is currently being cured in the studio. In the meantime, please reach out via email.
              </p>
              
              <div className="flex flex-col gap-6">
                <div className="h-[1px] bg-candera-stone/20 w-full" />
                <p className="font-sans text-[11px] italic text-candera-sage-text">
                  &ldquo;Scent is the most intense form of memory.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
