'use client';
import { useState, useEffect, useRef } from 'react';
import { useCities } from '@/hooks/use-cities';

export default function NewUpdateModal({ formData, setFormData, onSubmit, isOpen, setIsOpen }) {
  const [errors, setErrors] = useState({});
  const [citySearch, setCitySearch] = useState(formData?.city?.trim() || '');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const { cities, loading } = useCities();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const areaDropdownRef = useRef(null);
  
  // Area options in Hebrew
  const areaOptions = [
    'צפון',
    'דרום',
    'מזרח',
    'מערב',
    'מרכז'
  ];
  
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

  // Handle area selection
  const handleAreaSelect = (area) => {
    setFormData(prev => ({ ...prev, area }));
    setShowAreaDropdown(false);
    setErrors(prev => ({ ...prev, area: '' }));
  };
  
  // Toggle area dropdown
  const toggleAreaDropdown = () => {
    setShowAreaDropdown(!showAreaDropdown);
  };
  
  // Close area dropdown when clicking outside
  useEffect(() => {
    function handleClickOutsideArea(event) {
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target)) {
        setShowAreaDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutsideArea);
    return () => document.removeEventListener('mousedown', handleClickOutsideArea);
  }, []);

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
    // Required only: businessName, phone, city
    ['businessName', 'phone', 'city'].forEach((field) => {
      if (!currentFormData[field]) {
        newErrors[field] = 'חובה';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Use the parent component's onSubmit handler instead of making our own API call
    // This ensures consistent state management across components
    await onSubmit(currentFormData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">עדכן פרופיל</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Regular required fields (ordered): businessName, phone */}
          {[
            { label: 'שם עסק', name: 'businessName' },
            { label: 'טלפון', name: 'phone' },
          ].map((field) => (
            <div className="flex flex-col" key={field.name}>
              <label className="block text-sm font-medium text-gray-700">
                <span className="ml-1 text-red-500">*</span>
                <span>{field.label}</span>
              </label>
              <input
                type="text"
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className={`border ${
                  errors[field.name] ? 'border-red-500' : 'border-gray-300'
                } rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-customBlue ${
                  field.name === 'phone' ? 'text-left direction-ltr' : ''
                }`}
                dir={field.name === 'phone' ? 'ltr' : 'rtl'}
                placeholder={field.placeholder || ''}
              />
              {errors[field.name] && (
                <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

          {/* City dropdown (required) */}
          <div className="flex flex-col relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700">
              <span className="ml-1 text-red-500">*</span>
              <span>עיר</span>
            </label>
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
              <div className="absolute z-50 w-full mt-16 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
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

          {/* Area dropdown (optional) */}
          <div className="flex flex-col relative" ref={areaDropdownRef}>
            <label className="block text-sm font-medium text-gray-700">אזור</label>
            <div className="relative">
              <select
                name="area"
                value={formData.area || ''}
                onChange={handleChange}
                className={`border ${
                  errors.area ? 'border-red-500' : 'border-gray-300'
                } rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-customBlue`}
              >
                <option value="">בחר אזור</option>
                {areaOptions.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
            {/* area is optional; do not show error */}
          </div>

          {/* Optional fields in desired order: address, businessNumber */}
          {[
            { label: 'כתובת', name: 'address' },
            { label: 'ח.פ. / ע.מ', name: 'businessNumber' },
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
                } rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-customBlue ${
                  field.name === 'phone' ? 'text-left direction-ltr' : ''
                }`}
                dir={field.name === 'phone' ? 'ltr' : 'rtl'}
                placeholder={field.placeholder || ''}
              />
              {/* optional fields; no error display */}
            </div>
          ))}

          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="bg-customBlue text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              עדכן
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 