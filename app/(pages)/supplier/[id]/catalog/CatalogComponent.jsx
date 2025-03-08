"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useUserContext } from "@/app/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/catalog/Header";
import FilterSection from "@/components/catalog/FilterSection";
// import ProductList from "@/components/catalog/ProductList";
import EditProductPopup from "@/components/catalog/EditProductPopup";
import dynamic from 'next/dynamic';
import { Suspense } from "react";
import Loader from "@/components/loader/Loader";
import Link from "next/link";

const ProductList = dynamic(() => import('@/components/catalog/ProductList'))

// Add ProductSkeleton for better loading states
const ProductSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="grid grid-cols-6 gap-4 p-4 bg-white rounded-lg">
        <div className="col-span-2 md:col-span-1 h-16 bg-gray-200 rounded"></div>
        <div className="col-span-2 md:col-span-1 h-4 bg-gray-200 rounded"></div>
        <div className="hidden md:block h-4 bg-gray-200 rounded"></div>
        <div className="hidden md:block h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

export default function CatalogPage({sProducts, sCategories}) {
  const { globalUser } = useUserContext();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState(sCategories || []);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [lowStockNotification, setLowStockNotification] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { toast } = useToast();

  // Memoize the low stock check
  useEffect(() => {
    setProducts(sProducts)
    setLowStockNotification(products.some((product) => product.stock === 0));
  }, [sProducts, products]);

  // Optimize filtering with useMemo
  const filteredProductsMemo = useMemo(() => {
    return products.filter((product) => {
      const matchesStatus = selectedStatus === "low_stock" 
        ? product.stock === 0 
        : product.status === selectedStatus;
      const matchesCategory = selectedCategory 
        ? product.categoryId === selectedCategory 
        : true;
      return matchesStatus && matchesCategory;
    });
  }, [products, selectedCategory, selectedStatus]);

  useEffect(() => {
    setFilteredProducts(filteredProductsMemo);
  }, [filteredProductsMemo]);

  // Optimize scroll handling with useCallback
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 0;
    setIsScrolled(scrolled);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleStatusChange = useCallback((status) => {
    if (status === "low_stock") setLowStockNotification(false);
    
    // First update the states
    setSelectedStatus(status);
    setSelectedCategory('');
    
    // Use requestAnimationFrame to ensure DOM updates before scrolling
    requestAnimationFrame(() => {
      // Force scroll position to top immediately
      window.scrollTo(0, 0);
      
      // Then set the new scroll position without animation
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo({
        top: 0,
        behavior: 'auto'
      });
      
      // Reset scroll behavior after the scroll
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = '';
      }, 0);
    });
  }, []);

  // Optimize product updates with optimistic updates
  const handleUpdateProduct = async (updatedProduct) => {
    // Optimistic update
    setProducts(prev =>
      prev.map(product => 
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
  
    try {
      const response = await fetch("/api/products/edit-supplier-products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: updatedProduct._id,
          supplierId: globalUser._id,
          updates: updatedProduct,
        }),
      });
  
      if (response.ok) {
        const updatedData = await response.json();
        setEditingProduct(null);
        toast({
          title: "Success",
          description: "Product updated successfully.",
        });
      } else {
        // Revert on error
        setProducts(prev =>
          prev.map(product => 
            product._id === updatedProduct._id 
              ? products.find(p => p._id === updatedProduct._id) 
              : product
          )
        );
        throw new Error("Failed to update product.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the product.",
        variant: "destructive",
      });
    }
  };
  

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch("/api/products/delete-supplier-product", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, supplierId: globalUser._id }),
      });

      if (response.ok) {
        setProducts((prev) => prev.filter((product) => product._id !== productId));
        setEditingProduct(null);
        toast({
          title: "Deleted",
          description: "Product deleted successfully.",
          variant: "destructive",
        });
      } else {
        throw new Error("Failed to delete product.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the product.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full px-4 md:p-0">
        <div className="w-full max-w-5xl mx-auto">

        
        <div 
          className={`sticky md:top-20 top-12 z-10 transition-all duration-200 ease-in-out
            ${isScrolled ? 'bg-white shadow-md' : 'bg-[#f8f8ff]'} 
            w-full px-1 pt-6 pb-1`}
        >
       <div className="flex justify-between items-center mb-6 sticky top-12 z-10">
      <h1 className="text-2xl font-bold">קטלוג</h1>
      <Link href="/supplier/catalog/create-product">

        <button className="bg-customBlue text-white px-4 py-2 rounded-md hover:bg-hoveredBlue">
          הוסף מוצר +
        </button>
      </Link>
    </div>
      <FilterSection
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        handleStatusChange={handleStatusChange}
        lowStockNotification={lowStockNotification}
        categories={categories}
        supplierId={globalUser?._id}
      />
       <div className="grid grid-cols-6 gap-4 items-center pb-2 border-b-2 border-gray-500 md:p-2">
                  <div className="text-center font-semibold col-span-2 md:col-span-1"></div>
                    <div className="text-start font-semibold col-span-2 md:col-span-1 md:flex md:justify-center">שם</div>
                    <div className="text-center font-semibold hidden md:flex md:justify-center ">יחידות</div>
                    <div className="text-center font-semibold hidden md:flex md:justify-center">משקל יחידה</div>
                    <div className="text-center font-semibold">מלאי</div>
                    <div className="text-center font-semibold">מחיר</div>
                  </div>
        </div>
     <Suspense fallback={<ProductSkeleton />}>
     <ProductList
        products={filteredProducts}
        onEdit={(product) => setEditingProduct(product)}
      />
     </Suspense>
    
      </div>
     
    </div>
  );
}
