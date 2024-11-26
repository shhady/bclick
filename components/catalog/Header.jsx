import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">קטלוג</h1>
      <Link href="/supplier/catalog/create-product">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          הוסף מוצר +
        </button>
      </Link>
    </div>
  );
}
