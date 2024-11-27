// app/client/supplier/[id]/SupplierDetails.jsx
'use client';

export default function SupplierDetails({ user }) {
  console.log(user);
  return (
    <div>
      <h1>{user.name}</h1>
      {/* <p>{user.email}</p> */}
      {/* Render other user details as needed */}
    </div>
  );
}
