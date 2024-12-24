'use client';
import { fetchProducts } from '@/app/actions/productActions';
import Loader from '@/components/loader/Loader';
import Image from 'next/image';
import { useEffect, useState, useRef,useCallback } from 'react';
import StarToggle from '../StarToggle';
import { addToCart,getCart } from '@/app/actions/cartActions';
import { useCartContext } from '@/app/context/CartContext';

export default function ProductsOfCategory({ cart,favorites: initialFavorites, clientId, supplierId, categoryId, limit = 10 }) {
  const [products, setProducts] = useState([]); // Store all fetched products
  const [page, setPage] = useState(1); // Track the current page
  const [loading, setLoading] = useState(false); // Track loading state
  const [hasMore, setHasMore] = useState(true); // Track if more products are available
  const [initialFetchDone, setInitialFetchDone] = useState(false); // Track if the initial fetch is complete
  const observerRef = useRef(); // Ref for the Intersection Observer
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [groupedProducts, setGroupedProducts] = useState({}); // Grouped products by category

  console.log(products);
  // Function to fetch products
  const fetchMoreProducts = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return; // Prevent duplicate fetches or unnecessary fetches

    setLoading(true); // Start loading
    try {
      const nextPage = reset ? 1 : page; // Start from page 1 if reset
      const newProducts = await fetchProducts({ supplierId, categoryId, page: nextPage, limit });

      if (newProducts.length === 0) {
        setHasMore(false); // No more products available
      }   const grouped = newProducts.reduce((acc, product) => {
        const { categoryName } = product;
        if (!acc[categoryName]) acc[categoryName] = [];
        acc[categoryName].push(product);
        return acc;
      }, {});

      setGroupedProducts((prevGroups) => {
        if (reset) {
          return grouped;
        } else {
          // Merge with existing groups
          const updatedGroups = { ...prevGroups };
          Object.keys(grouped).forEach((category) => {
            if (!updatedGroups[category]) updatedGroups[category] = [];
            updatedGroups[category] = [
              ...updatedGroups[category],
              ...grouped[category],
            ];
          });
          return updatedGroups;
        }
      });

      setPage(reset ? 2 : page + 1); // Reset to page 2 or increment the current page
    
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false); // Stop loading
      setInitialFetchDone(true); // Mark initial fetch as complete
    }
  };

  // Initial fetch and category change handler
  useEffect(() => {
    setGroupedProducts({}); // Reset grouped products when category changes

    setProducts([]); // Reset products when category changes
    setPage(1); // Reset page to 1
    setHasMore(true); // Reset hasMore
    setInitialFetchDone(false); // Reset initial fetch tracker
    fetchMoreProducts(true); // Fetch the first batch of products
  }, [supplierId, categoryId]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    if (!initialFetchDone) return; // Wait for the initial fetch to complete
  
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMoreProducts(); // Fetch more products when the sentinel is visible
        }
      },
      { threshold: 1.0 } // Trigger when the sentinel is fully visible
    );
  
    if (observerRef.current) observer.observe(observerRef.current);
  
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [loading, hasMore, initialFetchDone]);

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

  useEffect(() => {
    const checkAndRefetch = async () => {
      if (Object.keys(groupedProducts).length === 0) {
        console.log('No products found, refetching...');
        await fetchMoreProducts(true);
      }
    };
  
    checkAndRefetch();
  }, [groupedProducts]);
  return (
    <div>
      <div>
      {Object.keys(groupedProducts).length > 0 ? (
  Object.keys(groupedProducts).map((categoryName) => (
    <div key={categoryName} className="mt-8">
      <h2 className="text-2xl font-bold mb-4">{categoryName}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 px-2">
        {groupedProducts[categoryName].length > 0 ? (
          groupedProducts[categoryName].map((product) => (
            <div
              key={product._id}
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
          ))
        ) : (
          <p className="text-gray-600 mt-4">אין מוצרים בקטגוריה זו.</p>
        )}
      </div>
    </div>
  ))
) : (
  <div className="text-center mt-4">
    <p className="text-gray-600">טוען מוצרים...</p>
  </div>
)}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-4 px-2">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="border p-4 rounded-lg shadow flex flex-col items-center animate-pulse"
      >
        {/* Skeleton Image */}
        <div className="w-full h-40 bg-gray-300 rounded"></div>
        {/* Skeleton Text */}
        <div className="w-3/4 h-4 bg-gray-300 rounded mt-4"></div>
        <div className="w-1/2 h-4 bg-gray-300 rounded mt-2"></div>
        <div className="w-1/3 h-4 bg-gray-300 rounded mt-2"></div>
      </div>
    ))}
  </div>
      )}
     {hasMore && (
    <div ref={observerRef} className="h-1 w-full"></div>
  )}
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
          <div className='flex justify-center gap-4 items-center'>
            <p className="text-gray-600">
              {reserved > 0 && `שמור: ${reserved}`}
            </p>
            <p className="text-gray-600">
              זמין במלאי: {availableStock} יחידות
            </p>
          </div>
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


  