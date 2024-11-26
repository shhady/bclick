'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import CreateModal from '@/components/CreateModal';
import UpdateModal from '@/components/UpdateModal';
import Profile from '@/components/Profile';
import Loader from '@/components/Loader';
import AdminProfile from '@/components/adminComponents/AdminProfile';
import SupplierProfile from '@/components/supplierComponents/SupplierProfile';
import ClientProfile from '@/components/clientComponents/ClientProfile';
import { useUserContext } from "@/app/context/UserContext";

export default function Page() {
  const { isLoaded, user } = useUser();
  const { globalUser, setGlobalUser, updateGlobalUser } = useUserContext();

  const [formData, setFormData] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  // Fetch user data and set formData
  useEffect(() => {
    const fetchUserFromDB = async () => {
      if (!isLoaded || !user) return;

      try {
        const response = await fetch(`/api/users/get-user/${user.id}`);
        if (response.ok) {
          const existingUser = await response.json();
          setGlobalUser(existingUser);
          setFormData(existingUser);

          // Check for missing fields
          const missingFields = [
            'businessName',
            'businessNumber',
            'address',
            'country',
            'area',
            'city',
            'phone',
          ].some((field) => !existingUser[field]);
          setIsCreateModalOpen(missingFields);
          setIsProfileComplete(!missingFields);
        } else if (response.status === 404) {
          setFormData({
            clerkId: user.id,
            name: user.fullName || `${user.firstName} ${user.lastName}` || '',
            email: user.emailAddresses[0]?.emailAddress || '',
            role: user.publicMetadata.role || 'client',
            profileImage: user.imageUrl || '',
            phone: user.phoneNumbers[0]?.phoneNumber || '',
            address: '',
            country: '',
            area: '',
            city: '',
            businessName: '',
            businessNumber: '',
          });
          setIsCreateModalOpen(true);
          setIsProfileComplete(false);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUserFromDB();
  }, [isLoaded, user]);

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/users/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setIsCreateModalOpen(false);
        setIsProfileComplete(true);
        setGlobalUser(result);
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch('/api/users/update-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setIsUpdateModalOpen(false);
        updateGlobalUser(result);
      }
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  if (!formData) {
    return <Loader />; // Render loader until data is fetched
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

      {!isCreateModalOpen && !isUpdateModalOpen && isProfileComplete && (
        <Profile formData={formData} onEdit={() => setIsUpdateModalOpen(true)} />
      )}

      {!isCreateModalOpen && !isUpdateModalOpen && !isProfileComplete && <Loader />}

      {formData.role === 'admin' && <AdminProfile />}
      {formData.role === 'supplier' && <SupplierProfile />}
      {formData.role === 'client' && <ClientProfile />}
    </div>
  );
}
