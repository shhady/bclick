"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNewUserContext } from "@/app/context/NewUserContext";
import { useToast } from "@/hooks/use-toast";
import FilterSection from "@/components/catalog/FilterSection";
import dynamic from 'next/dynamic';
import { Suspense } from "react";
import Loader from "@/components/loader/Loader";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

const ProductList = dynamic(() => import('@/components/catalog/ProductList'))

// Add ProductSkeleton for better loading states
const ProductSkeleton = () => (
  <div className="animate-pulse space-y-4 mt-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-2 md:col-span-1 h-24 bg-gray-200 rounded-lg"></div>
          <div className="col-span-2 md:col-span-1 h-5 bg-gray-200 rounded-lg"></div>
          <div className="hidden md:block h-5 bg-gray-200 rounded-lg"></div>
          <div className="hidden md:block h-5 bg-gray-200 rounded-lg"></div>
          <div className="h-5 bg-gray-200 rounded-lg"></div>
          <div className="h-5 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function CatalogPage({sProducts, sCategories}) {
  const { newUser } = useNewUserContext();
  const [products, setProducts] = useState([]); 
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState(sCategories || []);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [lowStockNotification, setLowStockNotification] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
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

  const handleStatusChange = useCallback((status) => {
    if (status === "low_stock") setLowStockNotification(false);
    
    // Update the states
    setSelectedStatus(status);
    setSelectedCategory('');
    
    // Use setTimeout to ensure DOM updates before scrolling
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'auto'
      });
    }, 10);
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
          supplierId: newUser._id,
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
        body: JSON.stringify({ productId, supplierId: newUser._id }),
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
    <div className="p-2 sm:p-4 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
        {/* Fixed header section - no longer sticky */}
        <div className="w-full bg-white pb-4">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">קטלוג המוצרים</h1>
            <Link href="/supplier/catalog/create-product">
              <button className="bg-customBlue text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 w-full sm:w-auto">
                <PlusCircle size={18} />
                הוסף מוצר
              </button>
            </Link>
          </div>

          {/* Filter Section */}
          <FilterSection
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            handleStatusChange={handleStatusChange}
            lowStockNotification={lowStockNotification}
            categories={categories}
            supplierId={newUser?._id}
          />

          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-7 gap-4 items-center pb-3 border-b border-gray-200 mb-4 font-medium text-gray-600 text-sm">
            <div className="text-center col-span-1"></div>
            <div className="text-center col-span-1">שם</div>
            <div className="text-center">יחידות</div>
            <div className="text-center">משקל יחידה</div>
            <div className="text-center">מלאי</div>
            <div className="text-center">מחיר</div>
            <div className="text-center">פעולות</div>
          </div>
        </div>

        {/* Product List - Scrollable content */}
        <div className="overflow-y-auto">
          <Suspense fallback={<ProductSkeleton />}>
            <ProductList
              products={filteredProducts}
              onEdit={(product) => setEditingProduct(product)}
            />
          </Suspense>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 rounded-xl mt-6 bg-gray-50 border border-gray-100">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400 mb-4" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-lg mb-2">
                {selectedCategory ? "אין מוצרים בקטגוריה זו" : 
                selectedStatus === "low_stock" ? "אין מוצרים חסרים במלאי" : 
                "אין מוצרים להצגה"}
              </p>
              <p className="text-gray-400 text-sm">
                נסה לשנות את הסינון או להוסיף מוצרים חדשים
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
