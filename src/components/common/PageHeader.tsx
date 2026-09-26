import React from 'react'

const PageHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => (
  <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
    <div>
      <h1 className="font-display text-xl sm:text-2xl font-semibold text-ink-900">{title}</h1>
      {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
)

export default PageHeader
