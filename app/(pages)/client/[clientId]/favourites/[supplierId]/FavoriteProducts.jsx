'use client'
import React, { useCallback, useRef, useState, useEffect } from 'react'
import SupplierCover from './SupplierCover';
import Image from 'next/image';
import StarToggle from '../../supplier-catalog/[id]/StarToggle';
import SupplierDetails from '../../supplier-catalog/[id]/SupplierDetails';
import { Suspense } from 'react';
import Loader from '@/components/loader/Loader';
import { addToCart } from '@/app/actions/cartActions';
import { useCartContext } from '@/app/context/CartContext';
import Link from 'next/link';
import { ArrowLeft, Heart, ShoppingBag, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Store the current supplierId in localStorage for navbar navigation
function storeCurrentSupplier(supplierId) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentSupplierId', supplierId);
  }
}

function ProductGrid({ 
  products, 
  clientId, 
  onFavoriteToggle,
  showProductDetail,
  cart 
}) {
  const { cart: contextCart } = useCartContext();
  
  // Use the cart from context if available, otherwise use the prop
  const currentCart = contextCart || cart;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-4 px-2">
      {products.map((product) => {
        const isInCart = currentCart?.items?.find((item) => item.productId?._id === product?._id);
        const isOutOfStock = product.stock === 0;
        
        return (
          <div
            key={product._id}
            onClick={() => showProductDetail(product)}
            className={`cursor-pointer border p-4 rounded-lg shadow hover:shadow-md transition flex flex-col items-center bg-white relative overflow-hidden ${isOutOfStock ? 'opacity-75' : ''}`}
          >
            {isInCart && (
              <div className="absolute top-2 right-2 bg-customBlue text-white text-xs px-2 py-1 rounded-full z-30">
                בעגלה
              </div>
            )}
            
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 z-10">
                <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  אזל מהמלאי
                </div>
              </div>
            )}
            
            <div className="absolute top-2 left-2 z-20">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle(product._id, false);
                }}
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              >
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              </button>
            </div>
            
            <div className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded-lg mb-3 bg-gray-50 p-2">
              <Image
                src={product?.imageUrl?.secure_url || '/no-image.jpg'}
                alt={product.name}
                width={160}
                height={160}
                className="object-contain max-h-full transition-transform hover:scale-105"
                loading="lazy"
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
      })}
    </div>
  );
}

// ProductDetailModal Component
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
  const [availableStock, setAvailableStock] = useState(
    product?.stock
  ); 
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { fetchCartAgain, addItemToCart } = useCartContext();
  const { toast } = useToast();

  useEffect(() => {
    // Only update cart state when myCart changes
    setCart(myCart);
  }, [myCart]);

  useEffect(() => {
    if (!product) return;
    
    setAvailableStock(product.stock);    
    const existingItem = cart?.items?.find(
      (item) => item?.productId?._id === product._id
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
        setError('');
        
        // Update the cart context to ensure UI updates immediately
        fetchCartAgain();
        
        // If the context has an addItemToCart function, use it to update the UI immediately
        if (addItemToCart) {
          addItemToCart(response.cart);
        }
        
        // Show success message
        toast({
          title: "נוסף לעגלה",
          description: `${product.name} נוסף לעגלה בהצלחה`,
        });
        
        onClose();
      } else {
        setError(response.message || 'שגיאה בהוספה לעגלה');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('שגיאה בהוספה לעגלה');
    } finally {
      setIsUpdating(false);
    }
  };

  // Add a function to remove the item from the cart
  const removeFromCartHandler = async () => {
    setIsRemoving(true);
    try {
      // Remove from the database
      const response = await fetch(`/api/cart?clientId=${clientId}&supplierId=${supplierId}&productId=${product._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      // Update the cart context to ensure UI updates immediately
      fetchCartAgain();
      
      // Show success message
      toast({
        title: "הוסר מהעגלה",
        description: `${product.name} הוסר מהעגלה בהצלחה`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setError('שגיאה בהסרת המוצר מהעגלה');
    } finally {
      setIsRemoving(false);
    }
  };

  if (!isVisible || !product) return null;

  const existingItem = cart?.items.find(
    (item) => item?.productId?._id === product?._id
  );

  const isOutOfStock = availableStock <= 0;

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
            
            {/* Favorite toggle */}
            <div className="absolute top-3 left-3">
              <StarToggle 
                productId={product._id} 
                clientId={clientId} 
                onFavoriteToggle={onFavoriteToggle}
              />
            </div>
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
                  {product.stock === 0 ? 'אזל מהמלאי' : `${availableStock} יחידות`}
                </span>
              </div>
            </div> */}
            
            {/* Quantity selector */}
            {product.stock > 0 && existingItem && (
              <div className="mb-4 flex flex-col items-center justify-center gap-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">כמות:</label>
                <div className="flex items-center">
                   <button 
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= availableStock || isUpdating}
                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded-r-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    min="1"
                    max={availableStock ? availableStock.toString() : "1"}
                    className="w-16 text-center border-y border-gray-200 py-2 focus:outline-none"
                  />
                  <button 
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1 || isUpdating}
                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded-l-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                 
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
            )}
            
            {/* Add to cart button */}
            <div className="mt-6 space-y-3">
              {existingItem ? (
                <>
                  <button
                    onClick={addToCartHandler}
                    disabled={product.stock === 0 || isUpdating || isRemoving}
                    className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isUpdating ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        מעדכן...
                      </div>
                    ) : (
                      'עדכן כמות בעגלה'
                    )}
                  </button>
                  
                  <button
                    onClick={removeFromCartHandler}
                    disabled={isRemoving || isUpdating}
                    className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-red-500 hover:bg-red-600 text-white"
                  >
                    {isRemoving ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        מסיר...
                      </div>
                    ) : (
                      'הסר מהעגלה'
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={addToCartHandler}
                  disabled={product.stock === 0 || isUpdating}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    product.stock === 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-customBlue hover:bg-blue-600 text-white'
                  }`}
                >
                  {isUpdating ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      מעדכן...
                    </div>
                  ) : product.stock === 0 ? (
                    'אזל מהמלאי'
                  ) : (
                    'הוסף לעגלה'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function FavoriteProducts({
  supplier,
  categories,
  supplierId,
  clientId,
  cart: initialCart,
  products: initialProducts,
  favorites: initialFavorites,
}) {
  const [products, setProducts] = useState(initialProducts);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const categoryRefs = useRef({}); // To store references for categories
  const { itemCount, cart: contextCart, fetchCartAgain } = useCartContext();
  const router = useRouter();
  
  // Store the current supplier ID for navbar navigation - only run once on mount
  useEffect(() => {
    storeCurrentSupplier(supplierId);
    
    // Force fetch cart once on component mount
    fetchCartAgain();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once
  
  // Use the cart from context if available, otherwise use the initial cart
  const currentCart = contextCart || initialCart;
  
  // Get cart count from context
  const cartCount = itemCount || (contextCart?.items?.length || 0);
  
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
        
        // If removing from favorites, check if we need to refresh the page
        if (!isFavorite) {
          // If this was the last favorite, refresh the page after a short delay
          const updatedFavorites = favorites.filter(p => p._id !== productId);
          if (updatedFavorites.length === 0) {
            setTimeout(() => {
              router.refresh();
            }, 300);
          }
        }
      }
    } catch (error) {
      console.error('Favorite toggle failed:', error);
    }
  }, [clientId, products, favorites, router]);
  
  const showProductDetail = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };
  
  return (
    <div className="mb-20 bg-[#f8f8ff]">
      <Suspense fallback={<Loader/>}>
        <SupplierCover supplier={supplier} />
      </Suspense>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<Loader/>}>
          <SupplierDetails 
            supplier={supplier} 
            clientId={clientId}
          />
        </Suspense>
        
        {/* Back to catalog button */}
        <div className="mb-6 flex justify-between items-center">
          {/* <Link 
            href={`/client/${clientId}/supplier-catalog/${supplierId}`}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>חזרה לקטלוג</span>
          </Link> */}
          
          {/* Cart button for mobile */}
          {cartCount > 0 && (
            <Link 
              href={`/cart/${supplierId}`}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-customBlue text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>עגלת קניות</span>
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            </Link>
          )}
        </div>
        
        {/* Favorites header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center gap-2">
          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
          <h1 className="text-xl font-bold">המועדפים שלי</h1>
        </div>
        
        <div>
          {favorites.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="bg-gray-100 p-4 rounded-full">
                  <Heart className="h-10 w-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold">אין מוצרים במועדפים</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-4">
                  לא נמצאו מוצרים במועדפים שלך. חזור לקטלוג והוסף מוצרים למועדפים.
                </p>
                <Link
                  href={`/client/${clientId}/supplier-catalog/${supplierId}`}
                  className="px-6 py-3 bg-customBlue text-white rounded-md hover:bg-blue-600 transition flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>חזרה לקטלוג</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="categories">
              {categories.map((category) => {
                const categoryFavorites = favorites.filter(
                  (product) => product.categoryId === category._id
                );

                if (categoryFavorites.length === 0) return null;

                return (
                  <div key={category._id} className="mb-8">
                    <h2 className="text-xl font-bold mb-4 bg-gray-100 px-4 py-2 rounded-lg">{category.name}</h2>
                    <Suspense fallback={<Loader/>}>
                      <ProductGrid
                        products={categoryFavorites}
                        clientId={clientId}
                        onFavoriteToggle={handleFavoriteToggle}
                        showProductDetail={showProductDetail}
                        cart={currentCart}
                      />
                    </Suspense>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <ProductDetailModal 
        product={selectedProduct}
        isVisible={!!selectedProduct}
        onClose={closeProductDetail}
        clientId={clientId}
        onFavoriteToggle={handleFavoriteToggle}
        supplierId={supplierId}
        cart={currentCart}
      />
      
    
    </div>
  );
}
