'use client';

import { useState, useEffect } from 'react';
import { useUserContext } from '@/app/context/UserContext';
import Link from 'next/link';
import PhotosUpload from '@/components/PhotosUpload';
import { useToast } from '@/hooks/use-toast';
import Loader from '@/components/loader/Loader';

export default function CreateProduct() {
  const { globalUser } = useUserContext(); // Get the logged-in supplier
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    stock: "",
    price: '',
    imageUrl: {},
    status: 'active',
  });
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  console.log(formData);
  useEffect(() => {
    const fetchCategories = async () => {
      if (!globalUser || !globalUser._id) {
        console.log('globalUser is not ready:', globalUser);
        return;
      }
  
      try {
        const response = await fetch(`/api/categories/get-categories?supplierId=${globalUser._id}`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data); // No filtering here to include all categories
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
  
    fetchCategories();
  }, [globalUser]);

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();

    try {
      let categoryId = formData.categoryId;

      // Handle General category creation or retrieval
      if (!categoryId) {
        const generalCategoryResponse = await fetch('/api/categories/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'כללי', supplierId: globalUser._id }),
        });

        if (generalCategoryResponse.ok) {
          const generalCategoryData = await generalCategoryResponse.json();
          if (generalCategoryData && generalCategoryData.category) {
            categoryId = generalCategoryData.category._id;
          } else {
            throw new Error('Failed to retrieve the General category data.');
          }
        } else {
          const errorResponse = await generalCategoryResponse.json();
          console.error('Error response from General category API:', errorResponse);
          throw new Error(errorResponse.error || 'Error creating General category.');
        }
      }

      // Set the status to 'draft' if saving as draft
      const finalStatus = isDraft ? 'draft' : formData.status;

      // Submit the product creation
      const response = await fetch('/api/products/create-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, categoryId, supplierId: globalUser._id, status: finalStatus }),
      });

      if (response.ok) {
        // setMessage(`Product ${isDraft ? 'saved as draft' : 'created successfully'}!`);
        setFormData({
          name: '',
          description: '',
          categoryId: '',
          stock: 0,
          price: '',
          imageUrl: '',
          status: 'active',
        });
        toast({
          title: (`${isDraft ? 'הטיוטה נשמרה בהצלחה':'המוצר נוצר בהצלחה'}`),
          description: 'תוכל להוסיף עוד מוצרים',
          variant: 'default',
        });
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to create product.');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setMessage('An error occurred. Please try again.');
    }
  };
 
  const handleCancel = ()=>{
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      stock: 0,
      price: '',
      imageUrl: '',
      status: 'active',
    });
  }
  if (!globalUser || !globalUser._id) {
    return <div><Loader/></div>; // Fallback while user is being loaded
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className='flex justify-between items-center mb-8'>
      <h1 className="text-xl font-bold">צור מוצר חדש</h1>
      <Link href={'/supplier/catalog/create-category'} className='w-1/3'>
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 w-full text-sm">
            צור קטגוריה 
          </button>
          </Link>
      </div>
      <form>
      <select
  value={formData.categoryId}
  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
  className="w-full p-2 border border-gray-300 rounded mb-4"
>
  {!formData.categoryId && <option value="">בחר קטגוריה (ברירת מחדל: כללי)</option>}
  {categories
    .filter((category) => category.name !== 'כללי') // Filter out "כללי" category
    .map((category) => (
      <option key={category._id} value={category._id}>
        {category.name} {category.status === 'hidden' ? '(מוסתר)' : ''}
      </option>
    ))}
</select>
        <input
          type="text"
          placeholder="שם מוצר"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />
        <input
          type="text"
          placeholder="תיאור מוצר"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <input
          type="number"
          placeholder="כמות במלאי"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />
        <input
          type="number"
          placeholder="מחיר"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />
        
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        >
          <option value="active">פרסם</option>
          <option value="hidden">מוסתר</option>
        </select>
      <PhotosUpload setFormData={setFormData} formData={formData} image={formData.imageUrl}/>
        <button
          type="submit"
          onClick={(e) => handleSubmit(e)} // Save as active product
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          צור מוצר
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)} // Save as draft
          className="w-full border-2 border-gray-400 text-black p-2 rounded  my-4"
        >
          שמור טיוטה
        </button>
        
      </form>
      <button
          type="button"
          onClick={() => handleCancel()} // Save as draft
          className="w-full border-2 border-gray-400 text-black p-2 rounded "
        >
          ביטול 
        </button>
      {message && <p className="text-center mt-4 text-green-600">{message}</p>}
    </div>
  );
}
