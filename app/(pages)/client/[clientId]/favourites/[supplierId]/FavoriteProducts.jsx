'use client'
import React, { useCallback, useRef, useState, useEffect } from 'react'
import SupplierCover from './SupplierCover';
import Image from 'next/image';
import StarToggle from '../../supplier-catalog/[id]/StarToggle';
import SupplierDetails from '../../supplier-catalog/[id]/SupplierDetails';
import { Suspense } from 'react';
import Loader from '@/components/loader/Loader';
import { getCart, addToCart } from '@/app/actions/cartActions';
function ProductGrid({ 
    products, 
    clientId, 
    onFavoriteToggle,
    showProductDetail 
  }) {
  
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-4 px-2">
       
        {products.map((product) => (
          <div
            key={product._id}
            className="cursor-pointer border p-4 rounded-lg shadow hover:shadow-md transition flex flex-col items-center"
            onClick={() => showProductDetail(product)}
          >
            <div 
              className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded"
             
            >
              {/* <StarToggle 
                productId={product._id} 
                clientId={clientId} 
                onFavoriteToggle={onFavoriteToggle}
                className="absolute top-2 right-2 z-10"
              /> */}
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
    );
  }
  
  // ProductDetailModal Component
  function ProductDetailModal({ 
    product, 
    isVisible, 
    onClose, 
    clientId, 
    onFavoriteToggle,
    supplierId
  }) {
   
  
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');
    const [reserved, setReserved] = useState(product?.reserved || 0);
    const [availableStock, setAvailableStock] = useState(
      product?.stock - product?.reserved || 0
    );
  
    useEffect(() => {
        setReserved(product?.reserved || 0);
        setAvailableStock(product?.stock - product?.reserved || 0);
        setQuantity(1); // Reset quantity on product change
        setError(''); // Clear error messages
      }, [product]);

    useEffect(() => {
        if(!clientId || supplierId) return;
        const fetchFavoriteStatus = async () => {
          try {
            const cart = await getCart({ clientId, supplierId });
            console.log(cart);
          } catch (error) {
            console.error('Error checking favorite status:', error);
          } finally {
            setChecking(false);
          }
        };
    
        fetchFavoriteStatus();
      }, [clientId, supplierId]);
      
    const handleQuantityChange = (e) => {
      const value = parseInt(e.target.value, 10);
      if (isNaN(value) || value <= 0) {
        setQuantity(1);
        setError('');
      } else if (value > stock) {
        setQuantity(stock);
        setError(`רק ${stock} זמין במלאי`);
      } else {
        setQuantity(value);
        setError('');
      }
    };
  
    const incrementQuantity = () => {
      if (quantity < availableStock) {
        setQuantity(quantity + 1);
        setError('');
      } else {
        setError(`רק ${stock} זמין במלאי`);
      }
    };
  
    const decrementQuantity = () => {
      if (quantity > 1) {
        setQuantity(quantity - 1);
        setError('');
      }
    };
  
    const addToCartHandler = async () => {
        if (quantity > availableStock) {
          setError(`רק ${availableStock} זמין במלאי`);
          return;
        }
    
        const response = await addToCart({
          clientId,
          supplierId,
          productId: product._id,
          quantity,
        });
    
        if (response.success) {
          setAvailableStock(response.updatedAvailableStock);
          setReserved(response.reserved);
          setError('');
          onClose()
        } else {
          setError(response.message);
        }
      };
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
          ):(<div>
          <div className="flex justify-center items-center gap-4 mt-4">
            <button 
              className="bg-gray-300 px-3 py-1 rounded" 
              onClick={decrementQuantity}
              disabled={quantity === 1}
            >
              -
            </button>
            <input
            dir='ltr'
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
            />
            <button 
              className="bg-gray-300 px-3 py-1 rounded" 
              onClick={incrementQuantity}
              disabled={quantity === product.stock}
            >
              +
            </button>
            
            </div>
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
            <div>
            <button 
              className="bg-customBlue text-white mt-6 px-4 py-2 rounded w-full"
              onClick={()=>addToCartHandler(clientId, supplierId, product._id, quantity)}
            >
              הוסף להזמנה
            </button>
            </div>
          </div>)}
            
          
          </div>
        </div>
      </div>
    );
  }

export default function FavoriteProducts({supplier,categories,
    supplierId,
    clientId,
    products: initialProducts,
    favorites: initialFavorites,}) {
        const [products, setProducts] = useState(initialProducts);
        const [favorites, setFavorites] = useState(initialFavorites);
        const [selectedProduct, setSelectedProduct] = useState(null);
        const categoryRefs = useRef({}); // To store references for categories
          console.log(favorites);
    console.log(supplier);
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
      console.log(favorites);
      const showProductDetail = (product) => {
        setSelectedProduct(product);
      };
    
      const closeProductDetail = () => {
        setSelectedProduct(null);
      };
      const scrollToCategory = (categoryId) => {
        if (categoryRefs.current[categoryId]) {
          categoryRefs.current[categoryId].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      console.log(supplierId);
  return (
    <div>
        <Suspense fallback={<Loader/>}>
         <SupplierCover supplier={supplier} clientId={clientId}/>
      <SupplierDetails 
        supplier={supplier} 
        clientId={clientId}
        
        
      /></Suspense>
      <div className="bg-[#D9D9D9] text-lg text-center overflow-x-auto whitespace-nowrap sticky top-[104px] md:top-[184px] z-50 shadow-xl">המועדפים שלי</div>
       <div>
          {favorites.length === 0 ? (
            <p className="text-center text-gray-500 mt-4 text-xl ">אין מוצרים במועדפים</p>
          ) : (
            <div className="categories">
              {categories.map((category) => {
                const categoryFavorites = favorites.filter(
                  (product) => product.categoryId === category._id
                );

                if (categoryFavorites.length === 0) return null;

                return (
                  <div key={category._id}>
                    <h2 className="text-2xl font-bold mt-4 px-4 py-2">{category.name}</h2>
                    <Suspense fallback={<Loader/>}> <ProductGrid
                      products={categoryFavorites}
                      clientId={clientId}
                      onFavoriteToggle={handleFavoriteToggle}
                      showProductDetail={(product) => setSelectedProduct(product)}
                    /></Suspense>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      
      <ProductDetailModal 
        product={selectedProduct}
        isVisible={!!selectedProduct}
        onClose={closeProductDetail}
        clientId={clientId}
        onFavoriteToggle={handleFavoriteToggle}
        supplierId={supplierId}
      />
    </div>
  )
}
