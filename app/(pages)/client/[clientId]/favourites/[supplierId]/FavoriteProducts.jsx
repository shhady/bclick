'use client'
import React, { useCallback, useRef, useState, useEffect } from 'react'
import SupplierCover from './SupplierCover';
import Image from 'next/image';
import StarToggle from '../../supplier-catalog/[id]/StarToggle';
import SupplierDetails from '../../supplier-catalog/[id]/SupplierDetails';
import { Suspense } from 'react';
import Loader from '@/components/loader/Loader';
import {  addToCart } from '@/app/actions/cartActions';
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
    supplierId,
    cart:myCart
  }) {
   
    
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');
    const [cart, setCart] = useState(myCart)
    const [reserved, setReserved] = useState(product?.reserved || 0);
    const [availableStock, setAvailableStock] = useState(
      product?.stock - (product?.reserved || 0)
    );

    console.log(product?.stock - product?.reserved);
    console.log(product);
    useEffect(() => {
      setReserved(product?.reserved || 0);
      setAvailableStock(product?.stock - (product?.reserved || 0));
      const existingItem = cart.items.find(
        (item) => item?.productId?._id === product?._id
      );
      if (existingItem) {
        setQuantity(existingItem.quantity);
      } else {
        setQuantity(1);
      }
      setError('');
    }, [product, cart]);

    console.log(cart);
   
    const handleQuantityChange = (newQuantity) => {
      console.log(newQuantity);
      if (newQuantity < 1) {
        setError('כמות לא יכולה להיות פחות מ-1');
        return;
      }
  
      if (newQuantity > availableStock) {
        console.log("dsfsf-------");
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
    
        const response = await addToCart({
          clientId,
          supplierId,
          productId: product._id,
          quantity,
        });
    
        if (response.success) {
          console.log(response.cart);
          setCart(response.cart)
          setAvailableStock(response.updatedAvailableStock);
          setReserved(response.reserved);
          setError('');
          onClose()
        } else {
          setError(response.message);
        }
      };
       if (!product) return null;
       console.log(cart);
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
           {quantity === 1 ? (<button className="bg-gray-100 px-3 py-1 rounded" onClick={()=>setError('כמות לא יכולה להיות פחות מ-1')}>
            -
</button>):(<button
    className="bg-gray-300 px-3 py-1 rounded"
    onClick={() => handleQuantityChange(quantity - 1)}
    // disabled={quantity === 1}
  >
    -
  </button>)} 
  
  <input
    type="number"
    value={quantity}
    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
    className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
  />
  {quantity >= availableStock ? (<button className="bg-gray-100 px-3 py-1 rounded" onClick={()=>setError(`הכמות המקסימלית הזמינה היא ${availableStock}`)}>
            +
</button>):( <button
    className="bg-gray-300 px-3 py-1 rounded"
    onClick={() => handleQuantityChange(quantity + 1)}
    // disabled={quantity >= availableStock}
  >
    +
  </button>)}
 
</div>
{error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

{cart.items.find((item) => item.productId._id === product._id) ? (
  <button
    className="bg-customBlue text-white mt-4 px-4 py-2 rounded w-full"
    onClick={addToCartHandler}
  >
    עדכן כמות
  </button>
) : (
  <button
    className="bg-customBlue text-white mt-4 px-4 py-2 rounded w-full"
    onClick={addToCartHandler}
  >
    הוסף להזמנה
  </button>
)}
          </div>)}
            {/* {error && <div>{error}</div>} */}
          
          </div>
        </div>
      </div>
    );
  }

export default function FavoriteProducts({supplier,categories,
    supplierId,
    clientId,
    cart,
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
      console.log(favorites);
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
        cart={cart}
      />
    </div>
  )
}
