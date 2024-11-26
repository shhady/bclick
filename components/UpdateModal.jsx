'use client';
import { useState } from 'react';

export default function UpdateModal({ formData, setFormData, onSubmit, isOpen, setIsOpen }) {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // Clear error on input change
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    ['businessName', 'businessNumber', 'address', 'country', 'area', 'city', 'phone'].forEach(
      (field) => {
        if (!formData[field]) {
          newErrors[field] = 'חובה';
        }
      }
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(); // Trigger the parent handler
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">עדכון פרטים</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'שם עסק', name: 'businessName' },
            { label: 'ח.פ. / ע.מ', name: 'businessNumber' },
            { label: 'כתובת', name: 'address' },
            { label: 'טלפון', name: 'phone' },
            { label: 'מדינה', name: 'country' },
            { label: 'אזור', name: 'area', placeholder: 'צפון, מערב, מזרח, דרום' },
            { label: 'עיר', name: 'city' },
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
                } rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder={field.placeholder || ''}
              />
              {errors[field.name] && (
                <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              עדכן
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
