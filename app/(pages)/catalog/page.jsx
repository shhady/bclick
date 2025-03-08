'use client'
import React, { Suspense } from 'react'
import { useNewUserContext } from '@/app/context/NewUserContext'
import ClientComponent from '../client/[clientId]/supplier-catalog/[id]/ClientComponent';
export default function page() {
  const { newUser } = useNewUserContext();
  console.log(newUser)

  return (
    <div>
      {newUser?.role === 'client' ? (
        <div>
        
        </div>
      ) : (
        <div>Supplier</div>
      )}
    </div>
  )
}
