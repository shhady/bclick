'use client';

import React from 'react';
import Navbar from './Navbar';
import NavbarSkeleton from './NavbarSkeleton'; // Create this component for the loading state
import { useNewUserContext } from '@/app/context/NewUserContext';

class NavbarErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Navbar Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <NavbarSkeleton />;
    }
    return this.props.children;
  }
}

// Wrap your Navbar component
export default function NavbarWrapper() {
  const { newUser, loading } = useNewUserContext();
  
  // Show skeleton while loading or if user data isn't available yet
  if (loading || !newUser) {
    return <NavbarSkeleton />;
  }
  
  return (
    <NavbarErrorBoundary>
      <Navbar />
    </NavbarErrorBoundary>
  );
} 