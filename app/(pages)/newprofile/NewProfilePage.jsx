'use client';
import { useEffect, useState } from 'react';
import { useNewUserContext } from '@/app/context/NewUserContext';
import NewCreateModal from '@/components/new-create-update-user/NewCreateModal';
import NewUpdateModal from '@/components/new-create-update-user/NewUpdateModal';
import NewProfile from '@/components/new-profile/NewProfile';
import NewLoader from '@/components/new-loader/NewLoader';
import NewAdminProfile from '@/components/new-admin-components/NewAdminProfile';
import NewSupplierProfile from '@/components/new-supplier-components/NewSupplierProfile';
import NewClientProfile from '@/components/new-client-components/NewClientProfile';

export default function NewProfilePage({ user, pendingOrdersCount, totalOrdersCount }) {
  const { newUser, setNewUser, clerkUser } = useNewUserContext();
  
  const [formData, setFormData] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkProfileCompletion = (userData) => {
    if (!userData) return false;
    
    const requiredFields = [
      'businessName',
      'businessNumber',
      'address',
      'country',
      'area',
      'city',
      'phone',
    ];
    
    return requiredFields.every((field) => userData[field] && userData[field].trim() !== '');
  };
   
  useEffect(() => {
    // Initialize the user profile using the passed user prop or newUser from context
    const userData = user || newUser;
    
    if (userData) {
      console.log('NewProfilePage useEffect - setting user data:', userData);
      
      // Only update the context if we have user data from the prop, not from context
      // This prevents an infinite loop of updates
      if (user && user !== newUser) {
        setNewUser(user);
      }
      
      // Always update local form data
      setFormData(userData);

      const isComplete = checkProfileCompletion(userData);
      setIsProfileComplete(isComplete);

      if (!isComplete) {
        setIsCreateModalOpen(true);
      }
      
      setIsLoading(false);
    } else if (clerkUser) {
      // If no user data but we have a clerk user, show the create modal
      // Create a new user object with Clerk data
      const newUserData = {
        clerkId: clerkUser.id,
        name: clerkUser.fullName || '',
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        role: 'client', // Default role is client
        profileImage: clerkUser.imageUrl || '',
        phone: '',
        address: '',
        country: '',
        area: '',
        city: '',
        businessName: '',
        businessNumber: '',
      };
      
      setFormData(newUserData);
      setIsCreateModalOpen(true);
      setIsLoading(false);
    }
  }, [user, clerkUser, newUser, setNewUser]);

  const handleCreate = async () => {
    try {
      setIsLoading(true);
      
      // Trim all string values in the form data
      const trimmedFormData = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key] = typeof value === 'string' ? value.trim() : value;
        return acc;
      }, {});

      console.log('NewProfilePage handleCreate - trimmedFormData:', trimmedFormData);

      const response = await fetch('/api/users/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trimmedFormData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('NewProfilePage handleCreate - API response:', result);
        
        // Update both the context and local state
        setNewUser(result);
        setFormData(result);
        setIsCreateModalOpen(false);
        setIsProfileComplete(true);
      } else {
        const error = await response.json();
        console.error('Error creating user profile:', error);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      
      // Trim all string values in the form data
      const trimmedFormData = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key] = typeof value === 'string' ? value.trim() : value;
        return acc;
      }, {});

      console.log('NewProfilePage handleUpdate - trimmedFormData:', trimmedFormData);

      const response = await fetch('/api/users/update-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trimmedFormData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('NewProfilePage handleUpdate - API response:', result);
        
        // First close the modal to prevent UI issues
        setIsUpdateModalOpen(false);
        
        // Update state directly without setTimeout to preserve object references
        setNewUser(result);
        setFormData(result);
      } else {
        const error = await response.json();
        console.error('Error updating user profile:', error);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <NewLoader />;
  }
  
  if (!formData) {
    return <NewLoader />;
  }
  
  return (
    <div>
      {isCreateModalOpen && (
        <NewCreateModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          isOpen={isCreateModalOpen}
        />
      )}

      {isUpdateModalOpen && (
        <NewUpdateModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdate}
          isOpen={isUpdateModalOpen}
          setIsOpen={setIsUpdateModalOpen}
        />
      )}

      {!isCreateModalOpen && !isUpdateModalOpen && (
        <>
          {isProfileComplete ? (
            <NewProfile formData={formData} onEdit={() => setIsUpdateModalOpen(true)} />
          ) : (
            <NewLoader />
          )}
            
          {formData.role === 'admin' && <NewAdminProfile />}
          {formData.role === 'supplier' && <NewSupplierProfile />}
          {formData.role === 'client' && <NewClientProfile />}
        </>
      )}
    </div>
  );
}
