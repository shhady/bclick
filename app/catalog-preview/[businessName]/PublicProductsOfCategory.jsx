'use client';
import Loader from '@/components/loader/Loader';
import Image from 'next/image';
import { useEffect, useState, useRef, useCallback, memo, useMemo } from 'react';

// Product skeleton for loading state
const ProductSkeleton = memo(function ProductSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-4 px-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="border p-4 rounded-lg shadow flex flex-col items-center animate-pulse">
          <div className="w-full h-40 bg-gray-300 rounded"></div>
          <div className="w-3/4 h-4 bg-gray-300 rounded mt-4"></div>
          <div className="w-1/2 h-4 bg-gray-300 rounded mt-2"></div>
          <div className="w-1/3 h-4 bg-gray-300 rounded mt-2"></div>
        </div>
      ))}
    </div>
  );
});

ProductSkeleton.displayName = 'ProductSkeleton';

// Product card component
const PublicProductCard = memo(function PublicProductCard({ product, showProductDetail }) {
  const isOutOfStock = product.stock === 0;
  
  return (
    <div
      onClick={() => showProductDetail(product)}
      className={`cursor-pointer border p-4 rounded-lg shadow hover:shadow-md transition flex flex-col items-center bg-white relative overflow-hidden ${isOutOfStock ? 'opacity-75' : ''}`}
    >
      {product.stock === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 z-10">
          <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
            אזל מהמלאי
          </div>
        </div>
      )}
      
      <div className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded-lg mb-3 p-2">
        <Image
          src={product?.imageUrl?.secure_url || '/no-image.jpg'}
          alt={product.name}
          width={160}
          height={160}
          className="object-contain max-h-full transition-transform hover:scale-105"
          loading="lazy"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
        />
      </div>
      
      <div className="w-full text-center">
        <h2 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2 h-10">{product.name}</h2>
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">{product.weight ? `משקל: ${product.weight} ${product.weightUnit}` : 'משקל לא צוין'}</span>
          <span className="text-lg font-bold text-customBlue">₪{product?.price}</span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.product._id === nextProps.product._id;
});

PublicProductCard.displayName = 'PublicProductCard';

// Product detail modal
function PublicProductDetailModal({ product, isVisible, onClose }) {
  if (!isVisible || !product) return null;

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="relative">
          {/* Product Image */}
          <div className="w-full h-64 bg-gray-100 rounded-t-xl overflow-hidden relative">
            <Image
              src={product?.imageUrl?.secure_url || '/no-image.jpg'}
              alt={product.name}
              fill
              className="object-contain p-4"
            />
            
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Product Details */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h2>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold text-customBlue">₪{product.price}</span>
              <span className="text-sm text-gray-500">{product.weight ? `משקל: ${product.weight} ${product.weightUnit}` : 'משקל לא צוין'}</span>
            </div>
            
            {product.description && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">תיאור המוצר:</h3>
                <p className="text-gray-600 text-sm">{product.description}</p>
              </div>
            )}
            
            {/* Stock information */}
            {/* <div className="mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">מלאי זמין:</span>
                <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {product.stock === 0 ? 'אזל מהמלאי' : `${product.stock} יחידות`}
                </span>
              </div>
            </div> */}
            
            {/* Note about ordering */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                להזמנת מוצר זה, אנא צרו קשר עם הספק ישירות או הירשמו כלקוח.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component
export default function PublicProductsOfCategory({ initialProducts = [], supplierId, categoryId, limit = 10 }) {
  const [groupedProducts, setGroupedProducts] = useState({});
  const [loadingState, setLoadingState] = useState({
    loading: false,
    hasMore: true,
    initialFetchDone: false,
    page: 1,
    error: null
  });
  const stateRef = useRef(loadingState);
  useEffect(() => {
    stateRef.current = loadingState;
  }, [loadingState]);
  const observerRef = useRef();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Memoize flattened products
  const allProducts = useMemo(() => 
    Object.values(groupedProducts).flat(),
    [groupedProducts]
  );

  // Function to fetch products
  const fetchMoreProducts = useCallback(async (reset = false) => {
    if (stateRef.current.loading || (!reset && !stateRef.current.hasMore)) return;
    
    setLoadingState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      page: reset ? 1 : prev.page 
    }));
    
    try {
      const currentPage = reset ? 1 : stateRef.current.page;
      const params = new URLSearchParams({
        supplierId,
        categoryId,
        page: String(currentPage),
        limit: String(limit),
      });

      const res = await fetch(`/api/products?${params.toString()}`, { method: 'GET' });
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await res.json();

      const newProducts = data?.products || [];
      const pagination = data?.pagination || { pages: 0, page: currentPage };

      if (!newProducts?.length) {
        setLoadingState(prev => ({ 
          ...prev, 
          hasMore: false, 
          loading: false,
          initialFetchDone: true 
        }));
        return;
      }

      // Group products by category
      const grouped = newProducts.reduce((acc, product) => {
        const { categoryName } = product;
        if (!acc[categoryName]) acc[categoryName] = [];
        acc[categoryName].push(product);
        return acc;
      }, {});

      setGroupedProducts(prevGroups => {
        if (reset) return grouped;

        // Merge with existing groups
        const updatedGroups = { ...prevGroups };
        Object.entries(grouped).forEach(([category, products]) => {
          if (!updatedGroups[category]) {
            updatedGroups[category] = products;
          } else {
            const existingIds = new Set(updatedGroups[category].map(p => p._id));
            const uniqueProducts = products.filter(p => !existingIds.has(p._id));
            updatedGroups[category] = [...updatedGroups[category], ...uniqueProducts];
          }
        });
        return updatedGroups;
      });

      // Fix: Use the pagination data from the response to determine if there are more pages
      const hasMorePages = (pagination?.pages ?? 0) > currentPage;

      setLoadingState(prev => ({
        ...prev,
        page: currentPage + 1,
        loading: false,
        initialFetchDone: true,
        hasMore: hasMorePages
      }));

      console.log(`Fetched page ${currentPage}/${pagination.pages}, hasMore: ${hasMorePages}`);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoadingState(prev => ({ 
        ...prev, 
        loading: false,
        error: 'Failed to load products. Please try again.',
        hasMore: true
      }));
    }
  }, [supplierId, categoryId, limit]);

  // Initialize with initial products if provided
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      // Group initial products by category
      const grouped = initialProducts.reduce((acc, product) => {
        const { categoryName } = product;
        if (!acc[categoryName]) acc[categoryName] = [];
        acc[categoryName].push(product);
        return acc;
      }, {});
      
      setGroupedProducts(grouped);
      setLoadingState(prev => ({
        ...prev,
        initialFetchDone: true,
        page: 2 // Start from page 2 since we already have page 1
      }));
    } else {
      // Reset and fetch if no initial products
      setGroupedProducts({});
      setLoadingState({
        loading: false,
        hasMore: true,
        initialFetchDone: false,
        page: 1,
        error: null
      });
      fetchMoreProducts(true);
    }
  }, [initialProducts, fetchMoreProducts]);

  // Reset and fetch when category changes
  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      setGroupedProducts({});
      setLoadingState({
        loading: false,
        hasMore: true,
        initialFetchDone: false,
        page: 1,
        error: null
      });
      fetchMoreProducts(true);
    }
  }, [categoryId, fetchMoreProducts, initialProducts]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    if (!loadingState.initialFetchDone || loadingState.loading || !loadingState.hasMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          console.log('Observer triggered, fetching more products');
          fetchMoreProducts(false);
        }
      },
      { rootMargin: '100px' }
    );

    const currentObserver = observer;
    const currentRef = observerRef.current;

    if (currentRef) {
      currentObserver.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        currentObserver.unobserve(currentRef);
      }
    };
  }, [loadingState.initialFetchDone, loadingState.loading, loadingState.hasMore]);

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  const showProductDetail = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="">
      <div>
        {Object.keys(groupedProducts).length > 0 ? (
          Object.keys(groupedProducts).map((categoryName) => (
            <div key={categoryName} className="mt-8">
              <h2 className="text-2xl font-bold mb-4">{categoryName}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 px-2">
                {groupedProducts[categoryName].map((product) => (
                  <PublicProductCard
                    key={product._id}
                    product={product}
                    showProductDetail={showProductDetail}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center mt-4">
            <p className="text-gray-600">
              {loadingState.loading ? 'טוען מוצרים...' : 'אין מוצרים להצגה'}
            </p>
          </div>
        )}

        {loadingState.error && (
          <div className="text-center py-4">
            <p className="text-red-500 mb-2">{loadingState.error}</p>
            <button 
              onClick={() => fetchMoreProducts(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              נסה שוב
            </button>
          </div>
        )}

        <div ref={observerRef} className="h-20 w-full">
          {loadingState.loading && <ProductSkeleton />}
          {!loadingState.loading && loadingState.hasMore && (
            <div className="text-center py-4">
              <p className="text-gray-500">גלול למטה לטעינת מוצרים נוספים</p>
            </div>
          )}
          {!loadingState.loading && !loadingState.hasMore && Object.keys(groupedProducts).length > 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500">אין מוצרים נוספים לטעינה</p>
            </div>
          )}
        </div>
      </div>

      <PublicProductDetailModal 
        product={selectedProduct}
        isVisible={!!selectedProduct}
        onClose={closeProductDetail}
      />
    </div>
  );
} 