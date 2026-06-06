'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, type CardPostData } from '@/components/Card'

interface ProductGridProps {
  products: CardPostData[]
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
      },
    },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20"
    >
      {products.map((product, i) => (
        <motion.div key={product.slug || i} variants={item}>
          <Card doc={product} relationTo="products" />
        </motion.div>
      ))}
    </motion.div>
  )
}
