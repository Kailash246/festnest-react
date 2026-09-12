// src/components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, requireAuth } = useApp();

  useEffect(() => {
    if (!isLoggedIn) {
      requireAuth();
    }
  }, [isLoggedIn, requireAuth]);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary mb-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="font-heading font-bold text-lg text-text-1 mb-1">
          Authentication Required
        </h2>
        <p className="text-sm text-text-3 max-w-sm mb-4">
          Please sign in to access your Refer &amp; Earn dashboard and spin the wheel.
        </p>
        <button
          type="button"
          onClick={() => requireAuth()}
          className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-all duration-150 active:scale-95"
        >
          Sign In
        </button>
      </div>
    );
  }

  return children;
}

