import React from 'react'
import Link from 'next/link'
import './index.scss'
import { Package, Tags, Inbox, BookOpen } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Documentation as DocumentationType } from '@/payload-types'

import { DashboardHeader } from './DashboardHeader'
import { QuickAccessCard } from './QuickAccessCard'
import { MetricCard } from './MetricCard'
import { ThemePresetSwitcher } from './ThemePresetSwitcher'
import { SectionTooltip } from './SectionTooltip'

const BeforeDashboard: React.FC = async () => {
  const payload = await getPayload({ config })

  let productCount = 0
  let categoryCount = 0
  let formSubmissionsCount = 0
  let newSubmissions = 0
  let docs: DocumentationType[] = []

  try {
    const [products, categories, submissions, documentation] = await Promise.all([
      payload.find({ collection: 'products', limit: 0, depth: 0 }),
      payload.find({ collection: 'categories', limit: 0, depth: 0 }),
      payload.find({ collection: 'form-submissions', limit: 0, depth: 0 }),
      payload.find({
        collection: 'documentation',
        where: { category: { not_equals: 'Seeding & Data' } },
        limit: 12,
        sort: 'order',
        depth: 0,
      }),
    ])
    productCount = products.totalDocs
    categoryCount = categories.totalDocs
    formSubmissionsCount = submissions.totalDocs
    docs = documentation.docs as unknown as DocumentationType[]

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const recent = await payload.find({
      collection: 'form-submissions',
      where: { createdAt: { greater_than: sevenDaysAgo } },
      limit: 0,
      depth: 0,
    })
    newSubmissions = recent.totalDocs
  } catch {
    // Dashboard renders with zeroed counts if DB is unavailable
  }

  return (
    <div className="mb-8">
      <DashboardHeader />

      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h2
            className="text-[0.7rem] font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--theme-elevation-700)' }}
          >
            Quick Access
          </h2>
          <SectionTooltip
            title="Quick Access"
            content="Jump directly to your key collections. Click any card to browse all items in that collection, or press the + button to create a new item instantly without leaving the dashboard."
          />
        </div>
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

      {docs.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2
              className="text-[0.7rem] font-semibold uppercase tracking-[0.12em]"
              style={{ color: 'var(--theme-elevation-700)' }}
            >
              User Documentation
            </h2>
            <SectionTooltip
              title="User Documentation"
              content="Help guides and documentation to help you manage your store effectively. These articles cover common tasks and best practices."
            />
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
            {docs.map((doc) => (
              <QuickAccessCard
                key={doc.id}
                label={doc.title}
                icon={BookOpen}
                href={`/admin/collections/documentation/${doc.id}`}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h2
            className="text-[0.7rem] font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--theme-elevation-700)' }}
          >
            Store Overview
          </h2>
          <SectionTooltip
            title="Store Overview"
            content={
              <>
                <p style={{ margin: '0 0 6px 0' }}>At-a-glance metrics for your store:</p>
                <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                  <li>
                    <strong>Total Products</strong> — published + draft items
                  </li>
                  <li>
                    <strong>Categories</strong> — taxonomy groups for filtering
                  </li>
                  <li>
                    <strong>New This Week</strong> — contact form submissions in the last 7 days
                  </li>
                  <li>
                    <strong>Total Inquiries</strong> — all form submissions ever received
                  </li>
                </ul>
              </>
            }
          />
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
          <MetricCard label="Total Products" value={productCount} />
          <MetricCard label="Categories" value={categoryCount} />
          <MetricCard label="New This Week" value={newSubmissions} />
          <MetricCard label="Total Inquiries" value={formSubmissionsCount} />
        </div>
      </section>

      <ThemePresetSwitcher />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--theme-elevation-150)',
        }}
      >
        <SectionTooltip
          title="More Content"
          content={
            <>
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                <li>
                  <strong>Pages &amp; Content</strong> — manage static pages like About and FAQ
                </li>
                <li>
                  <strong>Media</strong> — upload and organize images used across the site
                </li>
                <li>
                  <strong>Posts</strong> — blog-style articles for SEO and storytelling
                </li>
                <li>
                  <strong>SEO Briefs</strong> — AI-generated content briefs for product pages
                </li>
              </ul>
            </>
          }
        />
        <span
          style={{
            width: '1px',
            height: '14px',
            background: 'var(--theme-elevation-300)',
            flexShrink: 0,
          }}
        />
        <Link
          href="/admin/collections/pages"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--theme-elevation-700)',
            textDecoration: 'none',
          }}
        >
          Pages &amp; Content
        </Link>
        <Link
          href="/admin/collections/media"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--theme-elevation-700)',
            textDecoration: 'none',
          }}
        >
          Media
        </Link>
        <Link
          href="/admin/collections/posts"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--theme-elevation-700)',
            textDecoration: 'none',
          }}
        >
          Posts
        </Link>
        <Link
          href="/admin/collections/briefs"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--theme-elevation-700)',
            textDecoration: 'none',
          }}
        >
          SEO Briefs
        </Link>
      </div>
    </div>
  )
}

export default BeforeDashboard
