import React from 'react'
import Link from 'next/link'
import { Package, Tags, Inbox } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { DashboardHeader } from './DashboardHeader'
import { QuickAccessCard } from './QuickAccessCard'
import { MetricCard } from './MetricCard'

const BeforeDashboard: React.FC = async () => {
  const payload = await getPayload({ config })

  const [{ totalDocs: productCount }, { totalDocs: categoryCount }, { totalDocs: formSubmissionsCount }] =
    await Promise.all([
      payload.find({ collection: 'products', limit: 0, depth: 0 }),
      payload.find({ collection: 'categories', limit: 0, depth: 0 }),
      payload.find({ collection: 'form-submissions', limit: 0, depth: 0 }),
    ])

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { totalDocs: newSubmissions } = await payload.find({
    collection: 'form-submissions',
    where: { createdAt: { greater_than: sevenDaysAgo } },
    limit: 0,
    depth: 0,
  })

  return (
    <div className="mb-8">
      <DashboardHeader />

      <section className="mb-8">
        <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
          Quick Access
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
          <QuickAccessCard
            label="Products"
            icon={Package}
            count={productCount}
            href="/admin/collections/products"
            createHref="/admin/collections/products/create"
          />
          <QuickAccessCard
            label="Categories"
            icon={Tags}
            count={categoryCount}
            href="/admin/collections/categories"
            createHref="/admin/collections/categories/create"
          />
          <QuickAccessCard
            label="Form Submissions"
            icon={Inbox}
            count={formSubmissionsCount}
            href="/admin/collections/form-submissions"
            createHref="/admin/collections/form-submissions/create"
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
          Store Overview
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
          <MetricCard label="Total Products" value={productCount} />
          <MetricCard label="Categories" value={categoryCount} />
          <MetricCard label="New This Week" value={newSubmissions} />
          <MetricCard label="Total Inquiries" value={formSubmissionsCount} />
        </div>
      </section>

      <div className="flex gap-3 pt-5 border-t border-border">
        <Link href="/admin/collections/pages" className="text-[0.8125rem] text-muted-foreground no-underline hover:text-foreground hover:underline">
          Pages &amp; Content
        </Link>
        <Link href="/admin/collections/media" className="text-[0.8125rem] text-muted-foreground no-underline hover:text-foreground hover:underline">
          Media
        </Link>
        <Link href="/admin/collections/posts" className="text-[0.8125rem] text-muted-foreground no-underline hover:text-foreground hover:underline">
          Posts
        </Link>
      </div>
    </div>
  )
}

export default BeforeDashboard
