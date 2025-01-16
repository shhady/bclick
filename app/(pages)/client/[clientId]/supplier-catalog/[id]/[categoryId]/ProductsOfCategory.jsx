'use client';
import { fetchProducts } from '@/app/actions/productActions';
import Loader from '@/components/loader/Loader';
import Image from 'next/image';
import { useEffect, useState, useRef,useCallback, memo, useMemo } from 'react';
import StarToggle from '../StarToggle';
import { addToCart,getCart } from '@/app/actions/cartActions';
import { useCartContext } from '@/app/context/CartContext';
import dynamic from 'next/dynamic';

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

const ProductCard = memo(function ProductCard({ product, showProductDetail, cart }) {
  return (
    <div
      onClick={() => showProductDetail(product)}
      className="cursor-pointer border p-4 rounded-lg shadow hover:shadow-md transition flex flex-col items-center bg-white"
    >
      <div className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded">
        <Image
          src={product?.imageUrl?.secure_url || '/no-image.jpg'}
          alt={product.name}
          width={160}
          height={160}
          className="object-contain max-h-full"
          loading="lazy"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
        />
      </div>
      <h2 className="text-sm font-bold mt-2">{product.name}</h2>
      <p className="text-gray-600 mt-1">משקל: {product?.weight}</p>
      <p className="text-gray-600 mt-1">מחיר: ₪{product?.price}</p>
      <div className='flex justify-center items-center gap-4'>
        <p className="text-gray-600">
          {cart?.items.find((item) => item.productId?._id === product?._id)
            ? <span className='text-customBlue'>עדכן כמות</span>
            : ''}
        </p>
        {product.stock - (product.reserved || 0) === 0 && <p className="text-red-500">אינו זמין במלאי</p>}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.product._id === nextProps.product._id &&
         prevProps.cart?.items?.length === nextProps.cart?.items?.length;
});

ProductCard.displayName = 'ProductCard';



export default function ProductsOfCategory({ cart, favorites: initialFavorites, clientId, supplierId, categoryId, limit = 10 }) {
  const [groupedProducts, setGroupedProducts] = useState({});
  const [loadingState, setLoadingState] = useState({
    loading: false,
    hasMore: true,
    initialFetchDone: false,
    page: 1,
    error: null
  });
  const observerRef = useRef();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState(initialFavorites);

  // Memoize flattened products for favorites functionality
  const allProducts = useMemo(() => 
    Object.values(groupedProducts).flat(),
    [groupedProducts]
  );

  // Function to fetch products
  const fetchMoreProducts = useCallback(async (reset = false) => {
    if (loadingState.loading) return;
    
    setLoadingState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      page: reset ? 1 : prev.page 
    }));
    
    try {
      const response = await fetchProducts({ 
        supplierId, 
        categoryId, 
        page: reset ? 1 : loadingState.page,
        limit 
      });

      const { products: newProducts, pagination } = response;

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

      setLoadingState(prev => ({
        ...prev,
        page: prev.page + 1,
        loading: false,
        initialFetchDone: true,
        hasMore: loadingState.page < pagination.pages
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoadingState(prev => ({ 
        ...prev, 
        loading: false,
        error: 'Failed to load products. Please try again.',
        hasMore: true
      }));
    }
  }, [supplierId, categoryId, limit, loadingState.page]);

  // Reset and initial fetch when category changes
  useEffect(() => {
    setGroupedProducts({});
    setLoadingState({
      loading: false,
      hasMore: true,
      initialFetchDone: false,
      page: 1,
      error: null
    });
    fetchMoreProducts(true);
  }, [categoryId]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    if (!loadingState.initialFetchDone || loadingState.loading || !loadingState.hasMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
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
  }, [loadingState.initialFetchDone, loadingState.loading, loadingState.hasMore, fetchMoreProducts]);

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
            ? [...current, allProducts.find(p => p._id === productId)]
            : current.filter(p => p._id !== productId)
        );
      }
    } catch (error) {
      console.error('Favorite toggle failed:', error);
    }
  }, [clientId, allProducts]);

  const showProductDetail = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div>
      <div>
        {Object.keys(groupedProducts).length > 0 ? (
          Object.keys(groupedProducts).map((categoryName) => (
            <div key={categoryName} className="mt-8">
              <h2 className="text-2xl font-bold mb-4">{categoryName}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 px-2">
                {groupedProducts[categoryName].map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    showProductDetail={showProductDetail}
                    cart={cart}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center mt-4">
            <p className="text-gray-600">טוען מוצרים...</p>
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
        </div>
      </div>

      <ProductDetailModal 
        product={selectedProduct}
        isVisible={!!selectedProduct}
        onClose={closeProductDetail}
        clientId={clientId}
        supplierId={supplierId}
        onFavoriteToggle={handleFavoriteToggle}
        cart={cart}
      />
    </div>
  );
}



 function ProductDetailModal({ 
  product, 
  isVisible, 
  onClose, 
  clientId, 
  onFavoriteToggle, 
  supplierId, 
  cart: myCart 
}) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [cart, setCart] = useState(myCart);
  const [reserved, setReserved] = useState(product?.reserved || 0);
  const [availableStock, setAvailableStock] = useState(
    product?.stock - (product?.reserved || 0)
  ); 
   const [isUpdating, setIsUpdating] = useState(false);
   const { fetchCartAgain } = useCartContext();


  useEffect(() => {
    setReserved(product?.reserved || 0);
    setAvailableStock(product?.stock - (product?.reserved || 0));
    const existingItem = cart?.items.find(
      (item) => item?.productId?._id === product?._id
    );
    if (existingItem) {
      setQuantity(existingItem.quantity);
    } else {
      setQuantity(1);
    }
    setError('');
  }, [product, cart]);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      setError('כמות לא יכולה להיות פחות מ-1');
      return;
    }

    if (newQuantity > availableStock) {
      setError(`הכמות המקסימלית הזמינה היא ${availableStock}`);
      return;
    }

    setQuantity(newQuantity);
    setError('');
  };

  const addToCartHandler = async () => {
    if (quantity > availableStock) {
      setError(`רק ${availableStock} זמין במלאי`);
      return;
    }
    setIsUpdating(true);
    try {
      const response = await addToCart({
        clientId,
        supplierId,
        productId: product._id,
        quantity,
      });

      if (response.success) {
        setCart(response.cart);
        setAvailableStock(response.updatedAvailableStock);
        setReserved(response.reserved);
        setError('');
        fetchCartAgain()
        onClose();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('שגיאה בהוספת מוצר לעגלה');
      console.error('Add to cart error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!product) return null;
  
  console.log(error);
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
        <div className="relative flex justify-between items-center p-4">
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
            <h2 className="text-gray-600 font-bold">₪{product?.price}</h2>
          </div>
          <div className='flex justify-center gap-4 items-center'>
            <p className="text-gray-600">משקל: {product?.weight}</p>
            <p className="text-gray-600">יחידות: {product.units}</p>
          </div>
          <div className='flex justify-start gap-4 items-center'>
            <p className="text-gray-600">{product?.description}</p>
          </div>
          {/* <div className='flex justify-center gap-4 items-center'>
            <p className="text-gray-600">
              {reserved > 0 && `שמור: ${reserved}`}
            </p>
            <p className="text-gray-600">
              זמין במלאי: {availableStock} יחידות
            </p>
          </div> */}
          {availableStock === 0 ? (
            <p className="text-red-500 font-bold text-center">מוצר אין זמין במלאי</p>
          ) : (
            <div>
              <div className="flex justify-center items-center gap-4 mt-4">
                <button
                  className="bg-gray-300 px-3 py-1 rounded"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  // disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(Math.max(1, parseInt(e.target.value, 10)))}
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
                />
                <button
                  className="bg-gray-300 px-3 py-1 rounded"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  // disabled={quantity >= availableStock}
                >
                  +
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
              <button
                className={`bg-customBlue text-white mt-4 px-4 py-2 rounded w-full ${isUpdating ? 'animate-pulse' : ''}`}
                onClick={addToCartHandler}
                disabled={isUpdating}
              >
                {isUpdating ? ' שומר ...' : cart?.items.find((item) => item.productId._id === product._id)
                  ? 'עדכן כמות'
                  : 'הוסף להזמנה'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


  