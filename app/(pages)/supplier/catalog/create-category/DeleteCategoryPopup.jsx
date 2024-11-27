'use client'
import React, { useEffect, useState } from 'react'

export default function DeleteCategoryPopup({selectedCategory,status, setOpenDeletePopup,toggleCategoryStatus, handleDeleteCategory}) {

    const [hasProducts, setHasProducts] = useState()
    console.log(hasProducts);
    useEffect(()=>{
        const checking =async ()=>{
            const checkProducts = await fetch(`/api/categories/check-products?categoryId=${selectedCategory}`)
            const data = await checkProducts.json()
            setHasProducts(data.hasProducts);
        }
        checking()
    },[selectedCategory])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-8">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">

            {hasProducts ? <><div>יש מוצרים בקטגוריה זו אי אפשר למחוק אותה
                
                    תעביר אותם לקטגוריה אחרת או תמחק אותם
                </div>
                <div  className='flex justify-between items-center mx-4 mt-8'>
                    <button className='border-2  border-gray-700 rounded-lg mt-8 p-2 px-8'  onClick={()=>setOpenDeletePopup(false)}>חזור</button>
               {status==="shown" &&<button className='border-2 bg-gray-500 border-gray-700 rounded-lg mt-8 p-2 px-8'  onClick={()=>toggleCategoryStatus(selectedCategory,status)}>הסתר קטגוריה</button>} 
                </div></>:
            <div className=''>
                    בטוח רוצה למחוק ?
                    <div className='flex justify-between items-center mx-4 mt-8'>
                    <button className='bg-red-500 rounded-lg p-2 px-8 border-2 border-white' onClick={()=>handleDeleteCategory(selectedCategory)}>מחק</button>
                    <button className='border-2 border-gray-700 rounded-lg p-2 px-8' onClick={()=>setOpenDeletePopup(false)}>ביטול</button>
                    </div>
                    
                </div>}  
            </div>     
    </div>
  )
}
