// 'use client';

// import React, { useEffect, useState } from 'react';
// import Image from 'next/image';
// import StarToggle from './StarToggle';
// import Loader from '@/components/loader/Loader';

// export default function FavouritesClient({ products, clientId, onFavoriteChange }) {
//   const [favoriteProducts, setFavoriteProducts] = useState(products);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [isPopupVisible, setIsPopupVisible] = useState(false);

//   const closePopup = () => {
//     setIsPopupVisible(false);
//     setTimeout(() => setSelectedProduct(null), 300); // Delay to match transition duration
//   };

//   const openPopup = (product) => {
//     setSelectedProduct(product);
//     setTimeout(() => setIsPopupVisible(true), 0); // Ensure transition starts correctly
//   };
 
//   const handleRemove = (productId) => {
//     setFavoriteProducts((prev) => prev.filter((product) => product._id !== productId));
//     onFavoriteChange(productId, false);
//   };

//   // useEffect(()=>{
//   //   const fetchFavorites = async()=>{
//   //     const response = await fetch(`/api/favourites/${clientId}`);
//   //     const data = await response.json();  
//   //         setFavoriteProducts(data.products)
//   //   }
//   //   fetchFavorites(favoriteProducts)
//   // },[])
//   // console.log(favoriteProducts);

//   if(!favoriteProducts){
//     return <div><Loader /></div>
//   } else if(favoriteProducts.length === 0){
//     return <div className='flex flex-col justify-center items-center h-48 text-2xl'>אין מוצרים במועדפים</div>
//   }
//   return (
//     <div>
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//         {favoriteProducts?.map((product) => (
//           <div
//             key={product._id}
//             className="relative border p-4 rounded-lg shadow hover:shadow-lg transition"
            
//           >
//             <StarToggle
//               productId={product._id}
//               clientId={clientId}
//               onRemove={handleRemove}
//               confirmRemoval={true}
//             />
//               <div className="w-full h-40 flex items-center justify-center overflow-hidden rounded" onClick={() => openPopup(product)}>
//               <Image
//                 src={product?.imageUrl?.secure_url || '/no-image.jpg'}
//                 alt={product.name}
//                 width={160}
//                 height={160}
//                 className="object-contain max-h-full"
//               />
//             </div>
//             <h2 className="text-sm font-bold mt-2">{product.name}</h2>
//             <p className="text-gray-600 mt-1">משקל: {product?.weight}</p>
//             <p className="text-gray-600 mt-1">מחיר: ₪{product?.price}</p>
//             {/* <h2 className="text-sm font-bold mt-2">{product.name}</h2> */}
//           </div>
//         ))}
//       </div>
    
//       {selectedProduct && (
//         <div
//           className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end transition-opacity duration-300 ${
//             isPopupVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
//           }`}
//           onClick={closePopup} // Close when clicking outside
//         >
//           <div
//             className={`bg-white shadow-lg rounded-t-lg w-full max-w-lg overflow-y-auto transition-transform duration-300 transform ${
//               isPopupVisible ? 'translate-y-0' : 'translate-y-full'
//             }`}
//             onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
//           >
//             <div className="flex justify-between items-center p-4">
//             {/* <StarToggle productId={selectedProduct._id} clientId={clientId} /> */}
//                           <button onClick={closePopup} className="text-red-500 font-bold text-xl">
//                 X
//               </button>
//             </div>
//             <div className="p-16">
//               <Image
//                 src={selectedProduct?.imageUrl?.secure_url}
//                 alt={selectedProduct.name}
//                 width={400}
//                 height={400}
//                 className="w-full max-h-56 object-contain rounded"
//               />
//               <div className='flex justify-between items-center mt-4'>
//               <h2 className="text-lg font-bold">{selectedProduct.name}</h2>
//               <h2 className="text-gray-600 font-bold">מחיר: ₪{selectedProduct?.price}</h2>
//               </div>
//               <div className='flex justify-center gap-4 items-center'>
//               <p className="text-gray-600">משקל: {selectedProduct?.weight}</p>
//               <p className="text-gray-600">יחידות: {selectedProduct.units}</p>
//               </div>
//               <div className='flex justify-start gap-4 items-center'>
//               <p className="text-gray-600">{selectedProduct?.description}</p>
//               </div>
//               <div className="flex justify-center items-center gap-4 mt-4">
//                 <button className="bg-gray-300 px-3 py-1 rounded">-</button>
//                 <span>1</span>
//                 <button className="bg-gray-300 px-3 py-1 rounded">+</button>
//               </div>
//               <button className="bg-customBlue text-white mt-6 px-4 py-2 rounded w-full">
//               הוסף להזמנה
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
