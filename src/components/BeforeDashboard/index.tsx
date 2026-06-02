import React from 'react'
import { Package, Tags, Inbox } from 'lucide-react'

import { DashboardHeader } from './DashboardHeader'
import { QuickAccessCard } from './QuickAccessCard'
import { MetricCard } from './MetricCard'
import './index.scss'

type PayloadType = {
  find: (args: {
    collection: string
    limit?: number
    depth?: number
    sort?: string
    where?: Record<string, unknown>
  }) => Promise<{ totalDocs: number; docs: unknown[] }>
}

const BeforeDashboard: React.FC<{ payload: PayloadType; user: { email?: string; name?: string } }> = async ({
  payload,
  user,
}) => {
  const [{ totalDocs: productCount }, { totalDocs: categoryCount }, { totalDocs: formSubmissionsCount }] =
    await Promise.all([
      payload.find({ collection: 'products', limit: 0, depth: 0 }),
      payload.find({ collection: 'categories', limit: 0, depth: 0 }),
      payload.find({ collection: 'form-submissions', limit: 0, depth: 0 }),
    ])

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { totalDocs: newSubmissions } = await payload.find({
    collection: 'form-submissions',
    where: { createdAt: { greater_than: sevenDaysAgo } },
    limit: 0,
    depth: 0,
  })

  return (
    <div className="candera-dashboard">
      <DashboardHeader user={user} />

      <section className="candera-dashboard__quick-access">
        <h2 className="candera-dashboard__section-title">Quick Access</h2>
        <div className="candera-dashboard__cards">
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

      <section className="candera-dashboard__metrics">
        <h2 className="candera-dashboard__section-title">Store Overview</h2>
        <div className="candera-dashboard__metric-cards">
          <MetricCard label="Total Products" value={productCount} />
          <MetricCard label="Categories" value={categoryCount} />
          <MetricCard label="New This Week" value={newSubmissions} />
          <MetricCard label="Total Inquiries" value={formSubmissionsCount} />
        </div>
      </section>

      <div className="candera-dashboard__footer">
        <a href="/admin/collections/pages" className="candera-dashboard__footer-link">
          Pages &amp; Content
        </a>
        <a href="/admin/collections/media" className="candera-dashboard__footer-link">
          Media
        </a>
        <a href="/admin/collections/posts" className="candera-dashboard__footer-link">
          Posts
        </a>
      </div>
    </div>
  )
}

export default BeforeDashboard
