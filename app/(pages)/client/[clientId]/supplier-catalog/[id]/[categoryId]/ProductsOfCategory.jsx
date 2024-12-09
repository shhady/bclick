'use client';
import { fetchProducts } from '@/app/actions/productActions';
import Loader from '@/components/loader/Loader';
import Image from 'next/image';
import { useEffect, useState, useRef,useCallback } from 'react';
import StarToggle from '../StarToggle';

export default function ProductsOfCategory({ favorites: initialFavorites, clientId, supplierId, categoryId, limit = 10 }) {
  const [products, setProducts] = useState([]); // Store all fetched products
  const [page, setPage] = useState(1); // Track the current page
  const [loading, setLoading] = useState(false); // Track loading state
  const [hasMore, setHasMore] = useState(true); // Track if more products are available
  const observerRef = useRef(); // Ref for the Intersection Observer
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState(initialFavorites);

  // Function to fetch products
  const fetchMoreProducts = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return; // Prevent duplicate fetches or unnecessary fetches

    setLoading(true); // Start loading
    try {
      const nextPage = reset ? 1 : page; // Start from page 1 if reset
      const newProducts = await fetchProducts({ supplierId, categoryId, page: nextPage, limit });

      if (newProducts.length === 0) {
        setHasMore(false); // No more products available
      } else {
        setProducts((prevProducts) => (reset ? newProducts : [...prevProducts, ...newProducts])); // Append or reset products
        setPage(reset ? 2 : page + 1); // Reset to page 2 or increment the current page
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Initial fetch and category change handler
  useEffect(() => {
    setProducts([]); // Reset products when category changes
    setPage(1); // Reset page to 1
    setHasMore(true); // Reset hasMore
    fetchMoreProducts(true); // Fetch the first batch of products
  }, [supplierId, categoryId]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMoreProducts(); // Fetch more products when the last item is visible
        }
      },
      { threshold: 1.0 } // Trigger when the target is fully visible
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [loading, hasMore]);
  const closeProductDetail = () => {
    setSelectedProduct(null);
  };
  const handleFavoriteToggle = useCallback(async (productId, isFavorite) => {
    try {
      const endpoint = isFavorite 
        ? `/api/favourites/add` 
        : `/api/favourites/remove`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ clientId, productId }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setFavorites(current => 
          isFavorite 
            ? [...current, products.find(p => p._id === productId)]
            : current.filter(p => p._id !== productId)
        );
      }
    } catch (error) {
      console.error('Favorite toggle failed:', error);
    }
  }, [clientId, products]);
  const showProductDetail = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-4 px-2">
        {products.map((product, index) => (
          <div
          onClick={() => showProductDetail(product)}

            key={product._id}
            ref={index === products.length - 1 ? observerRef : null} // Set ref to the last product
            className="cursor-pointer border p-4 rounded-lg shadow hover:shadow-md transition flex flex-col items-center"
          >
            <div className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded">
              <Image
                src={product?.imageUrl?.secure_url || '/no-image.jpg'}
                alt={product.name}
                width={160}
                height={160}
                className="object-contain max-h-full"
              />
            </div>
            <h2 className="text-sm font-bold mt-2">{product.name}</h2>
            <p className="text-gray-600 mt-1">משקל: {product?.weight}</p>
            <p className="text-gray-600 mt-1">מחיר: ₪{product?.price}</p>
          </div>
        ))}
      </div>
      {loading && <div className="flex justify-center items-center gap-3 text-center mt-4">
        <div className='h-1 w-1 bg-black rounded-full animate-bounce [animation-delay:-0.3s]'></div>
              <div className='h-1 w-1 bg-black rounded-full animate-bounce [animation-delay:-0.15s]'></div>
              <div className='h-1 w-1 bg-black rounded-full animate-bounce'></div>
        </div>}
      {!hasMore && (
        <div className="text-center mt-4 text-gray-500">אין עוד מוצרים בקטגוריה זו.</div>
      )}
        <ProductDetailModal 
        product={selectedProduct}
        isVisible={!!selectedProduct}
        onClose={closeProductDetail}
        clientId={clientId}
        onFavoriteToggle={handleFavoriteToggle}
      />
    </div>
  );
}


function ProductDetailModal({ 
    product, 
    isVisible, 
    onClose, 
    clientId, 
    onFavoriteToggle 
  }) {
    if (!product) return null;
  
    return (
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      >
        <div
          className={`bg-white shadow-lg rounded-t-lg w-full max-w-lg overflow-y-auto transition-transform duration-300 transform ${
            isVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className=" relative flex justify-between items-center p-4">
            <div className='absolute top-4 right-4'>
            <StarToggle
              productId={product._id} 
              clientId={clientId} 
              onFavoriteToggle={onFavoriteToggle}
            />
            </div>
          
            <button onClick={onClose} className="text-red-500 font-bold text-xl absolute top-4 left-4">
              X
            </button>
          </div>
          <div className="p-16">
            <Image
              src={product?.imageUrl?.secure_url || '/no-image.jpg'}
              alt={product.name}
              width={400}
              height={400}
              className="w-full max-h-56 object-contain rounded"
            />
            <div className='flex justify-between items-center mt-4'>
              <h2 className="text-lg font-bold">{product.name}</h2>
              <h2 className="text-gray-600 font-bold">מחיר: ₪{product?.price}</h2>
            </div>
            <div className='flex justify-center gap-4 items-center'>
              <p className="text-gray-600">משקל: {product?.weight}</p>
              <p className="text-gray-600">יחידות: {product.units}</p>
            </div>
            <div className='flex justify-start gap-4 items-center'>
              <p className="text-gray-600">{product?.description}</p>
            </div>
            <div className="flex justify-center items-center gap-4 mt-4">
              <button className="bg-gray-300 px-3 py-1 rounded">-</button>
              <span>1</span>
              <button className="bg-gray-300 px-3 py-1 rounded">+</button>
            </div>
            <button className="bg-customBlue text-white mt-6 px-4 py-2 rounded w-full">
              הוסף להזמנה
            </button>
          </div>
        </div>
      </div>
    );
  }