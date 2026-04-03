// app/report/page.tsx
import { Suspense } from 'react'
import ReportPageContent from './ReportPageContent'

export default function ReportPage() {
  return (
    <Suspense>
      <ReportPageContent />
    </Suspense>
  )
}
