import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Create a loading component
const OrdersLoading = () => (
  <div className="p-4">Loading orders...</div>
)

// Dynamically import the client component with suspense
const AllOrdersClient = dynamic(() => import('./AllOrdersClient'), {
  ssr: false,
  loading: () => <OrdersLoading />
})

export default function AllOrdersPage() {
  return (
    <Suspense fallback={<OrdersLoading />}>
      <AllOrdersClient />
    </Suspense>
  )
}
