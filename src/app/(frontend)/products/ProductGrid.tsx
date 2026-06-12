'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Card, type CardPostData } from '@/components/Card'

interface ProductGridProps {
  products: CardPostData[]
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const shouldReduceMotion = useReducedMotion()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : undefined,
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  }

  const item = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : undefined,
        type: shouldReduceMotion ? undefined : ('spring' as const),
        stiffness: shouldReduceMotion ? undefined : 300,
        damping: shouldReduceMotion ? undefined : 20,
      },
    },
  }

  return (
    <motion.ul
      variants={container}
      initial={shouldReduceMotion ? false : 'hidden'}
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20 list-none p-0"
    >
      {products.map((product, i) => (
        <motion.li key={product.slug || i} variants={item}>
          <Card doc={product} relationTo="products" />
        </motion.li>
      ))}
    </motion.ul>
  )
}
