'use client';

import Footer from '@/components/homePage/Footer';
import { FaLock, FaInfoCircle, FaGavel } from 'react-icons/fa';

const PageLayout = ({ title, icon, children }) => {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto bg-white text-black rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-4">
          {icon && <div className="text-4xl text-[#D732A8]">{icon}</div>}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="mt-4">{children}</div>
      </div>
      <Footer/>
    </div>
  );
};

export default PageLayout;
