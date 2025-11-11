'use client'
import { useEffect, useState, Suspense } from 'react';
import CreateModal from '@/components/create-update-user/CreateModal';
import UpdateModal from '@/components/create-update-user/UpdateModal';
// import Profile from '@/components/Profile';
import Loader from '@/components/loader/Loader';
// import AdminProfile from '@/components/adminComponents/AdminProfile';
// import SupplierProfile from '@/components/supplierComponents/SupplierProfile';
// import ClientProfile from '@/components/clientComponents/ClientProfile';
import { useUserContext } from "@/app/context/UserContext";
import { useUserCompat as useUser } from '@/hooks/useUserCompat';
import dynamic from 'next/dynamic';

const Profile = dynamic(() => import('@/components/Profile'), {
  loading: () => <Loader />,
  ssr: false
})
const AdminProfile = dynamic(() => import('@/components/adminComponents/AdminProfile'), {
  loading: () => <Loader />,
  ssr: false
})
const SupplierProfile = dynamic(() => import('@/components/supplierComponents/SupplierProfile'), {
  loading: () => <Loader />,
  ssr: false
})
const ClientProfile = dynamic(() => import('@/components/clientComponents/ClientProfile'), {
  loading: () => <Loader />,
  ssr: false
})

export default function ProfilePage({ user, pendingOrdersCount, totalOrdersCount }) {
  const { globalUser, setGlobalUser } = useUserContext();
  const { user: clerkUser } = useUser();

  const [formData, setFormData] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const checkProfileCompletion = (userData) => {
    const requiredFields = [
      'businessName',
      'businessNumber',
      'address',
      'country',
      'area',
      'city',
      'phone',
    ];
    return requiredFields.every((field) => userData[field]);
  };
   
  useEffect(() => {
    // Initialize the user profile using the passed user prop
    if (user) {
      
      // Use a timeout to ensure the state update is processed
      setTimeout(() => {
        setGlobalUser(user);
      }, 0);
      
      setFormData(user);

      const isComplete = checkProfileCompletion(user);
      setIsProfileComplete(isComplete);

      if (!isComplete) {
        setIsCreateModalOpen(true);
      }
    } else if (clerkUser) {
      // If no user data but we have a clerk user, show the create modal
      setIsCreateModalOpen(true);
    }
  }, [user, clerkUser, setGlobalUser]);

  const handleCreate = async () => {
    try {
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
        
        
        // Use a timeout to ensure the state update is processed
        setTimeout(() => {
          setGlobalUser(result);
        }, 0);
        
        setFormData(result);
        setIsCreateModalOpen(false);
        setIsProfileComplete(true);
      } else {
        const error = await response.json();
        console.error('Error creating/updating user profile:', error);
        // You might want to show this error to the user
      }
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      // You might want to show this error to the user
    }
  };

  const handleUpdate = async () => {
    try {
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
       
        // Use a timeout to ensure the state update is processed
        setTimeout(() => {
          setGlobalUser(result);
        }, 0);
        
        setFormData(result);
        setIsUpdateModalOpen(false);
      } else {
        const error = await response.json();
        console.error('Error updating user profile:', error);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  if (!formData) {
    return <Loader />;
  }
  
  return (
    <div>
      {isCreateModalOpen && (
        <CreateModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          isOpen={isCreateModalOpen}
        />
      )}

      {isUpdateModalOpen && (
        <UpdateModal
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
            <Profile formData={formData} onEdit={() => setIsUpdateModalOpen(true)} />
          ) : (
            <Loader />
          )}

          {formData.role === 'admin' && <AdminProfile />}
          {formData.role === 'supplier' && <SupplierProfile pendingOrdersCount={pendingOrdersCount} totalOrdersCount={totalOrdersCount}/>}
          {formData.role === 'client' && <ClientProfile user={user}/>}
        </>
      )}
    </div>
  );
}
