'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useNewUserContext } from '@/app/context/NewUserContext'
import dynamic from 'next/dynamic'
import Loader from '@/components/loader/Loader'

// Dynamically import the supplier and client components
const SupplierCatalogComponent = dynamic(() => import('../../supplier/[id]/catalog/CatalogComponent'), {
  loading: () => <Loader />
})

const ClientComponent = dynamic(() => import('../../client/[clientId]/supplier-catalog/[id]/ClientComponent'), {
  loading: () => <Loader />
})

export default function CatalogComponent({ 
  supplier, 
  categories, 
  favorites, 
  cart, 
  userRole, 
  userId, 
  supplierId 
}) {
  const { newUser } = useNewUserContext()
  

  // State for infinite scrolling products
  const [page, setPage] = useState(1)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  // Fetch products with infinite scrolling
  useEffect(() => {
    const fetchProducts = async () => {
      if (!hasMore || loading) return
      
      setLoading(true)
      try {
        const response = await fetch(`/api/products?supplierId=${supplierId}&page=${page}&limit=20`)
        const data = await response.json()
        
        if (data.products.length === 0) {
          setHasMore(false)
        } else {
          // Ensure products have unique IDs by checking if they already exist
          const newProducts = data.products.filter(
            newProduct => !products.some(existingProduct => existingProduct._id === newProduct._id)
          );
          
          setProducts(prev => [...prev, ...newProducts])
          setPage(prev => prev + 1)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [supplierId, page, hasMore, products, loading])
  
  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (!hasMore || loading) return
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          // Load more products when the sentinel is visible
          setPage(prev => prev + 1)
        }
      },
      { threshold: 0.1 }
    )
    
    const sentinel = document.getElementById('infinite-scroll-sentinel')
    if (sentinel) {
      observer.observe(sentinel)
    }
    
    return () => {
      if (sentinel) {
        observer.unobserve(sentinel)
      }
    }
  }, [hasMore, loading])
  
  // Conditional rendering based on user role
  if (userRole === 'supplier' && newUser?._id === supplierId) {
    return (
      <Suspense fallback={<Loader />}>
        <SupplierCatalogComponent
          sProducts={products} 
          sCategories={categories} 
        />
      </Suspense>
    )
  }
  
  // Default to client view
  return (
    <Suspense fallback={<Loader />}>
      <ClientComponent 
        supplier={supplier}
        categories={categories}
        favorites={favorites}
        cart={cart}
        clientId={userId}
      />
      {/* Sentinel element for infinite scrolling */}
      {hasMore && (
        <div 
          id="infinite-scroll-sentinel" 
          className="h-10 w-full flex items-center justify-center"
        >
          {loading && <Loader />}
        </div>
      )}
    </Suspense>
  )
}   
