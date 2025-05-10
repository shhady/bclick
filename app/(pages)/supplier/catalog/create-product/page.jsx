'use client';

import { useState, useEffect } from 'react';
import { useNewUserContext } from '@/app/context/NewUserContext';
import Link from 'next/link';
import PhotosUpload from '@/components/PhotosUpload';
import { useToast } from '@/hooks/use-toast';
import Loader from '@/components/loader/Loader';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, PlusCircle, Tag, ShoppingBag, AlertCircle, BarChart4, ImagePlus } from 'lucide-react';

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
          duration: 2000,
        });
        
        // Navigate back to catalog after successful creation
        router.push(`/supplier/${newUser._id}/catalog`);
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
    <div className="p-4 sm:p-6 max-w-4xl mx-auto mb-24 md:mb-0">
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          {/* <button 
            onClick={() => router.back()} 
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button> */}
          <h1 className="text-2xl font-bold text-gray-800">יצירת מוצר חדש</h1>
        </div>
        
        <Link href={`/supplier/catalog/create-category/${newUser._id}`}>
          <button className="bg-white border border-gray-200 shadow-sm text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            <PlusCircle size={18} className="text-customBlue" />
            <span>צור קטגוריה</span>
          </button>
        </Link>
      </div>
      
      {!hasCategories && (
        <div className="bg-amber-50 border-r-4 border-amber-500 text-amber-800 p-4 mb-6 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-amber-500" />
            <div>
              <p className="font-bold">שים לב!</p>
              <p>עליך ליצור קטגוריה לפני שתוכל ליצור מוצר.</p>
              <Link href={`/supplier/catalog/create-category/${newUser._id}`}>
                <button className="mt-3 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors">
                  צור קטגוריה עכשיו
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Main form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <form className="space-y-6">
          {/* Basic Info Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-customBlue" />
              <span>פרטי מוצר בסיסיים</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">קטגוריה *</label>
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
                  className={`w-full p-2.5 border rounded-lg shadow-sm h-[42px] focus:ring-2 focus:ring-customBlue focus:border-customBlue ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">שם מוצר *</label>
                <input
                  type="text"
                  placeholder="הזן שם מוצר"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-customBlue focus:border-customBlue ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            </div>
            
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">תיאור מוצר</label>
              <textarea
                placeholder="הזן תיאור מפורט של המוצר"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm mb-4 h-[100px] focus:ring-2 focus:ring-customBlue focus:border-customBlue"
              />
            </div>
          </div>
          
          {/* Inventory Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-customBlue" />
              <span>מלאי ומידות</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">יחידות במוצר</label>
                <input
                  type="text"
                  placeholder="כמות יחידות"
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-customBlue focus:border-customBlue"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">משקל מוצר</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="משקל"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-2/3 p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-customBlue focus:border-customBlue"
                  />
                  <select
                    value={formData.weightUnit}
                    onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                    className="w-1/3 p-2.5 border border-gray-300 rounded-lg shadow-sm h-[42px] focus:ring-2 focus:ring-customBlue focus:border-customBlue"
                  >
                    <option value="גרם">גרם</option>
                    <option value="קילוגרם">ק&quot;ג</option>
                    <option value="ליטר">ליטר</option>
                    <option value='מ"ל'>מ&quot;ל</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ברקוד (אופציונלי)</label>
              <input
                type="text"
                placeholder="הזן ברקוד אם קיים"
                value={formData.barCode}
                onChange={(e) => setFormData({ ...formData, barCode: e.target.value })}
                className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-customBlue focus:border-customBlue"
              />
            </div>
          </div>
          
          {/* Pricing & Status Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart4 className="h-5 w-5 text-customBlue" />
              <span>מחיר ומלאי</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">כמות במלאי *</label>
                <input
                  type="number"
                  placeholder="כמות במלאי"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className={`w-full p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-customBlue focus:border-customBlue ${errors.stock ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">מחיר (₪) *</label>
                <input
                  type="number"
                  placeholder="מחיר"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className={`w-full p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-customBlue focus:border-customBlue ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">סטטוס מוצר</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm h-[42px] focus:ring-2 focus:ring-customBlue focus:border-customBlue"
                >
                  <option value="active">פרסם</option>
                  <option value="hidden">מוסתר</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Image Upload Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-customBlue" />
              <span>תמונת מוצר</span>
            </h2>
            
            <PhotosUpload setFormData={setFormData} formData={formData} image={formData.imageUrl}/>
          </div>
          
          {message && (
            <div className="bg-red-50 border-r-4 border-red-500 text-red-800 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p>{message}</p>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {loading ? (
              <button
                type="button"
                disabled
                className="w-full sm:flex-1 bg-blue-400 text-white p-2.5 rounded-lg flex items-center justify-center gap-2"
              >
                <span className="animate-pulse">שומר...</span>
              </button>
            ) : (
              <button
                type="submit"
                onClick={(e) => handleSubmit(e)}
                disabled={loading || !hasCategories}
                className={`w-full sm:flex-1 p-2.5 rounded-lg flex items-center justify-center gap-2 ${
                  !hasCategories 
                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                    : 'bg-customBlue text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
                }`}
              >
                <Save size={18} />
                <span>צור מוצר</span>
              </button>
            )}
            
            {draftLoading ? (
              <button
                type="button"
                disabled
                className="w-full sm:flex-1 bg-gray-300 text-gray-700 p-2.5 rounded-lg flex items-center justify-center gap-2"
              >
                <span className="animate-pulse">שומר טיוטה...</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={draftLoading || !hasCategories}
                className={`w-full sm:flex-1 border-2 border-gray-300 p-2.5 rounded-lg flex items-center justify-center gap-2 ${
                  !hasCategories ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                שמור טיוטה
              </button>
            )}
            
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
