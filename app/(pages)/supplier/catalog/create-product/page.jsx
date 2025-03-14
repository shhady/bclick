'use client';

import { useState, useEffect } from 'react';
import { useNewUserContext } from '@/app/context/NewUserContext';
import Link from 'next/link';
import PhotosUpload from '@/components/PhotosUpload';
import { useToast } from '@/hooks/use-toast';
import Loader from '@/components/loader/Loader';
import { useRouter } from 'next/navigation';

export default function CreateProduct() {
  const { newUser } = useNewUserContext(); // Get the logged-in supplier
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    stock: "",
    price: '',
    units:'',
    barCode:'',
    weight:'',
    weightUnit:'גרם',
    imageUrl: {},
    status: 'active',
  });
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [hasCategories, setHasCategories] = useState(true); // Track if supplier has any categories

  const router = useRouter();
  
  const validateFields = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'שם המוצר נדרש.';
    if (!formData.stock) newErrors.stock = 'כמות במלאי נדרשת.';
    if (!formData.price) newErrors.price = 'מחיר נדרש.';
    if (!formData.categoryId) newErrors.categoryId = 'יש לבחור קטגוריה.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      if (!newUser || !newUser._id) {
        return;
      }
  
      try {
        const response = await fetch(`/api/categories/get-categories?supplierId=${newUser._id}`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          setHasCategories(data.length > 0);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
  
    fetchCategories();
  }, [newUser]);

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    
    // Clear previous messages
    setMessage('');
    
    // Validate fields
    if (!validateFields()) {
      // Show specific message for category
      if (errors.categoryId) {
        setMessage('יש לבחור קטגוריה לפני יצירת מוצר');
      } else {
        setMessage('חלק מהפרטים חסרים');
      }
      return;
    }

    if (isDraft) setDraftLoading(true);
    else setLoading(true);

    try {
      const finalStatus = isDraft ? 'draft' : formData.status;

      const response = await fetch('/api/products/create-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          supplierId: newUser._id, 
          status: finalStatus 
        }),
      });

      if (response.ok) {
        setFormData({
          name: '',
          description: '',
          categoryId: '',
          stock: '',
          price: '',
          units: '',
          weight: '',
          weightUnit: 'גרם',
          barCode: '',
          imageUrl: '',
          status: 'active',
        });
        setErrors({});
        setMessage('');
        toast({
          title: `${isDraft ? 'הטיוטה נשמרה בהצלחה' : 'המוצר נוצר בהצלחה'}`,
          description: '',
          variant: 'default',
        });
      } else {
        const error = await response.json();
        console.error('Error:', error.error || 'Failed to create product.');
        setMessage(error.error || 'אירעה שגיאה ביצירת המוצר');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setMessage('אירעה שגיאה ביצירת המוצר');
    } finally {
      if (isDraft) setDraftLoading(false);
      else setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      stock: '',
      price: '',
      units: '',
      barCode: '',
      weight: '',
      weightUnit: 'גרם',
      imageUrl: '',
      status: 'active',
    });
    setErrors({});
    router.back();
  };
  
  if (!newUser || !newUser._id) {
    return <div><Loader/></div>;
  }

  return (
    <div className="p-6 mb-24 md:mb-0 max-w-md mx-auto">
      <div className='flex justify-between items-center mb-8 md:mb-4'>
        <h1 className="text-xl font-bold">צור מוצר חדש</h1>
        <Link href={`/supplier/catalog/create-category/${newUser._id}`} className='w-1/3'>
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 w-full text-sm">
            צור קטגוריה 
          </button>
        </Link>
      </div>
      
      {!hasCategories && (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6 rounded">
          <p className="font-bold">שים לב!</p>
          <p>עליך ליצור קטגוריה לפני שתוכל ליצור מוצר.</p>
          <Link href={`/supplier/catalog/create-category/${newUser._id}`}>
            <button className="mt-2 bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600">
              צור קטגוריה עכשיו
            </button>
          </Link>
        </div>
      )}
      
      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
          <select
            value={formData.categoryId}
            onChange={(e) => {
              setFormData({ ...formData, categoryId: e.target.value });
              if (errors.categoryId) {
                const newErrors = {...errors};
                delete newErrors.categoryId;
                setErrors(newErrors);
              }
            }}
            className={`w-full p-2 border rounded h-[42px] ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">בחר קטגוריה</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name} {category.status === 'hidden' ? '(מוסתר)' : ''}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">שם מוצר</label>
          <input
            type="text"
            placeholder="שם מוצר"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full p-2 border rounded mb-1 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">תיאור מוצר</label>
          <textarea
            placeholder="תיאור מוצר"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded mb-4 h-[120px]"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">יחידות במוצר</label>
          <input
            type="text"
            placeholder="יחידות במוצר"
            value={formData.units}
            onChange={(e) => setFormData({ ...formData, units: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">משקל מוצר</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              placeholder="משקל מוצר"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className={`w-2/3 p-2 border rounded ${errors.weight ? 'border-red-500' : 'border-gray-300'}`}
            />
            <select
              value={formData.weightUnit}
              onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
              className="w-1/3 p-2 border border-gray-300 rounded h-[42px]"
            >
              <option value="גרם">גרם</option>
              <option value="קילוגרם">קילו</option>
              <option value="ליטר">ליטר</option>
              <option value='מ"ל'>מ"ל</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">ברקוד (אופציונלי)</label>
          <input
            type="text"
            placeholder="ברקוד"
            value={formData.barCode}
            onChange={(e) => setFormData({ ...formData, barCode: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">כמות במלאי</label>
          <input
            type="number"
            placeholder="כמות במלאי"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            className={`w-full p-2 border rounded mb-1 ${errors.stock ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.stock && <p className="text-red-500 text-sm">{errors.stock}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">מחיר</label>
          <input
            type="number"
            placeholder="מחיר"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className={`w-full p-2 border rounded mb-1 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס מוצר</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded h-[42px]"
          >
            <option value="active">פרסם</option>
            <option value="hidden">מוסתר</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">תמונת מוצר</label>
          <PhotosUpload setFormData={setFormData} formData={formData} image={formData.imageUrl}/>
        </div>
        
        {message && <p className="text-center mb-4 text-red-500">{message}</p>}
        
        <div className="space-y-4">
          {loading ? (
            <div className="w-full bg-customBlue text-white p-2 rounded animate-pulse text-center">
              שומר...
            </div>
          ) : (
            <button
              type="submit"
              onClick={(e) => handleSubmit(e)}
              disabled={loading || !hasCategories}
              className={`w-full p-2 rounded ${!hasCategories ? 'bg-gray-400 cursor-not-allowed' : 'bg-customBlue text-white hover:bg-hoveredBlue'}`}
            >
              צור מוצר
            </button>
          )}
          
          {draftLoading ? (
            <div className="w-full bg-gray-300 text-gray-700 p-2 rounded animate-pulse text-center">
              שומר טיוטה...
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={draftLoading || !hasCategories}
              className={`w-full border-2 border-gray-400 p-2 rounded ${!hasCategories ? 'text-gray-400 cursor-not-allowed' : 'text-black'}`}
            >
              שמור טיוטה
            </button>
          )}
          
          <button
            type="button"
            onClick={handleCancel}
            className="w-full border-2 border-gray-400 text-black p-2 rounded"
          >
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
}
