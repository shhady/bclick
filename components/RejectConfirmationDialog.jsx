import React, { useState } from 'react';

export function RejectConfirmationDialog({ isOpen, onClose, onConfirm, orderNumber }) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!note.trim()) {
      setError('חובה להוסיף הערה בעת דחיית הזמנה');
      return;
    }
    onConfirm(note);
    setNote('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-right shadow-xl transition-all sm:w-full sm:max-w-lg">
          {/* Content */}
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-right w-full">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  האם אתה בטוח שברצונך לדחות את ההזמנה?
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    הזמנה מספר #{orderNumber} תדחה. פעולה זו לא ניתנת לביטול.
                  </p>
                  <textarea
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      setError('');
                    }}
                    placeholder="הוסף הערה (חובה)"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:w-auto"
            >
              דחה הזמנה
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              ביטול
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
