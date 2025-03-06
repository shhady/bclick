'use client';
import React from "react";

// Simple Error UI Component
function ErrorUI() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          אופס! משהו השתבש
        </h1>
        <p className="text-gray-600 mb-6">
          אנו מתנצלים על התקלה. אנא נסו שוב או חזרו לדף הבית
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            רענן דף
          </button>
          <button
            onClick={() => window.location.href = '/newprofile'}
            className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            חזור לדף הבית
          </button>
        </div>
      </div>
    </div>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorUI />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 