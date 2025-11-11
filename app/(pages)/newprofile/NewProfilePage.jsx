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
    // Prioritize newUser over the user prop
    const userData = newUser || user;
    
    if (userData) {
      
      // Only update the context if the user prop exists but newUser is not set yet
      if (user && !newUser) {
        setNewUser(user);
      }
      
      // Update local formData and check profile completeness
      setFormData(userData);
      const isComplete = checkProfileCompletion(userData);
      setIsProfileComplete(isComplete);
      
      if (!isComplete) {
        setIsCreateModalOpen(true);
      }
      
      setIsLoading(false);
    } else if (clerkUser) {
      // Create a new user object from Clerk if necessary
      const newUserData = {
        name: clerkUser.firstName || '',
        email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
        role: 'client',
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


      const response = await fetch('/api/users/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trimmedFormData),
      });

      if (response.ok) {
        const result = await response.json();
        
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


      const response = await fetch('/api/users/update-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trimmedFormData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // First close the modal to prevent UI issues
        setIsUpdateModalOpen(false);
        
        // Update both the context and local state with the updated user data
        setNewUser(result);
        setFormData(result);
        
        // Force a re-render by updating a state variable
        setIsProfileComplete(checkProfileCompletion(result));
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
