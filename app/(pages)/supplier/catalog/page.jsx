"use client";

import React, { useState, useEffect } from "react";
import { useUserContext } from "@/app/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/catalog/Header";
import FilterSection from "@/components/catalog/FilterSection";
import ProductList from "@/components/catalog/ProductList";
import EditProductPopup from "@/components/catalog/EditProductPopup";

export default function CatalogPage() {
  const { globalUser } = useUserContext();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [lowStockNotification, setLowStockNotification] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!globalUser || !globalUser._id) return;

    const fetchProductsAndCategories = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`/api/products/get-supplier-products?supplierId=${globalUser._id}`),
          fetch(`/api/categories/get-categories?supplierId=${globalUser._id}`),
        ]);

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
          setLowStockNotification(productsData.some((product) => product.stock === 0));
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchProductsAndCategories();
  }, [globalUser]);

  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesStatus = selectedStatus === "low_stock" ? product.stock === 0 : product.status === selectedStatus;
      const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
      return matchesStatus && matchesCategory;
    });
    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedStatus]);

  const handleStatusChange = (status) => {
    if (status === "low_stock") setLowStockNotification(false);
    setSelectedStatus(status);
  };

  const handleUpdateProduct = async (updatedProduct) => {
    if (updatedProduct.stock > 0) {
      updatedProduct.status = "active";
    }

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
        setProducts((prev) =>
          prev.map((product) => (product._id === updatedData.product._id ? updatedData.product : product))
        );
        setEditingProduct(null);
        toast({
          title: "Success",
          description: "Product updated successfully.",
        });
      } else {
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
    <div className="p-6">
      <Header />
      <FilterSection
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        handleStatusChange={handleStatusChange}
        lowStockNotification={lowStockNotification}
        categories={categories}
      />
      <ProductList
        products={filteredProducts}
        onEdit={(product) => setEditingProduct(product)}
      />
      {editingProduct && (
        <EditProductPopup
          product={editingProduct}
          categories={categories}
          onUpdate={handleUpdateProduct}
          onDelete={handleDeleteProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}
