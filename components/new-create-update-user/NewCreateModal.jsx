'use client';
import { useState, useEffect, useRef } from 'react';
import { useCities } from '@/hooks/use-cities';
import { useNewUserContext } from "@/app/context/NewUserContext";

export default function NewCreateModal({ formData, setFormData, onSubmit, isOpen }) {
  const [errors, setErrors] = useState({});
  const [citySearch, setCitySearch] = useState(formData?.city?.trim() || '');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const { cities, loading } = useCities();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const { setNewUser } = useNewUserContext();

  // Initialize citySearch when formData changes
  useEffect(() => {
    if (formData?.city) {
      setCitySearch(formData.city.trim());
    }
  }, [formData?.city]);

  // Filter cities based on search input
  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCitySelect = (city) => {
    const trimmedCity = city.trim();
    setCitySearch(trimmedCity);
    setFormData(prev => ({ ...prev, city: trimmedCity }));
    setShowCityDropdown(false);
    setErrors(prev => ({ ...prev, city: '' }));
  };

  const handleCityInputChange = (e) => {
    const value = e.target.value;
    setCitySearch(value);
    setFormData(prev => ({ ...prev, city: value.trim() }));
    // Always show dropdown when typing
    setShowCityDropdown(true);
  };

  const toggleCityDropdown = () => {
    setShowCityDropdown(!showCityDropdown);
    // Focus the input when opening the dropdown
    if (!showCityDropdown) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim all string values in the form data
    const trimmedFormData = Object.entries(formData).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'string' ? value.trim() : value;
      return acc;
    }, {});

    const currentFormData = {
      ...trimmedFormData,
      city: citySearch.trim()
    };

    const newErrors = {};
    ['businessName', 'businessNumber', 'address', 'country', 'area', 'city', 'phone'].forEach(
      (field) => {
        if (!currentFormData[field]) {
          newErrors[field] = 'חובה';
        }
      }
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch('/api/users/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentFormData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update the new user context
        setTimeout(() => {
          setNewUser(result);
        }, 0);
        
        // Update the form data in the parent component
        setFormData(result);
        
        // Call the parent's onSubmit function which will close the modal
        onSubmit();
      } else {
        const error = await response.json();
        console.error('Error creating user profile:', error);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">יצירת פרופיל</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Regular form fields */}
          {[
            { label: 'שם עסק', name: 'businessName' },
            { label: 'ח.פ. / ע.מ', name: 'businessNumber' },
            { label: 'כתובת', name: 'address' },
            { label: 'טלפון', name: 'phone' },
            { label: 'מדינה', name: 'country' },
            { label: 'אזור', name: 'area', placeholder: 'צפון, מערב, מזרח, דרום' },
          ].map((field) => (
            <div className="flex flex-col" key={field.name}>
              <label className="block text-sm font-medium text-gray-700">{field.label}</label>
              <input
                type="text"
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className={`border ${
                  errors[field.name] ? 'border-red-500' : 'border-gray-300'
                } rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-customBlue`}
                placeholder={field.placeholder || ''}
              />
              {errors[field.name] && (
                <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

          {/* City dropdown */}
          <div className="flex flex-col relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700">עיר</label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={citySearch}
                onChange={handleCityInputChange}
                onFocus={() => setShowCityDropdown(true)}
                className={`border ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                } rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-customBlue pl-8`}
                placeholder="חפש עיר..."
              />
              <button
                type="button"
                onClick={toggleCityDropdown}
                className="absolute left-2 top-1/2 -translate-y-1/2"
              >
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    showCityDropdown ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
            
            {showCityDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {loading ? (
                  <div className="p-2 text-center text-gray-500">טוען ערים...</div>
                ) : filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <div
                      key={city}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleCitySelect(city)}
                    >
                      {city}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-center text-gray-500">
                    {citySearch ? 'לא נמצאו ערים' : 'לחץ על החץ לרשימת הערים'}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-customBlue text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              שמור
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 