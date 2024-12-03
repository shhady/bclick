'use client';
import Image from 'next/image';
import React from 'react';

export default function VideoInsideComputer() {
  return (
    <div className="flex flex-col items-center justify-center mt-[-110px] lg:mt-[-160px]">
      {/* Video Section */}
      <div className="relative mx-auto w-[320px] h-[200px] sm:w-[400px] sm:h-[250px] md:w-[500px] md:h-[312px] lg:w-[600px] lg:h-[375px] xl:w-[800px] xl:h-[500px]" dir='ltr'>
        {/* Computer Frame */}
        <Image
          src="/trans-comp.png" // Add a computer frame image in your public folder
          alt="Computer Frame"
          height={1000}
          width={1000}
          className="w-full h-full"
        />
        {/* Video */}
        <div className="absolute top-[2%] left-[10%] md:top-[2%] md:left-[10%] xl:top-[2%] xl:left-[10%] w-[80%] h-[88%] overflow-hidden rounded-lg">
        <iframe width="949" height="534" src="https://www.youtube.com/embed/reUZRyXxUs4" 
        title="How AI Could Empower Any Business | Andrew Ng | TED" 
        frameBorder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
         referrerpolicy="strict-origin-when-cross-origin" 
         allowFullScreen={true}
>

         </iframe>
          
        </div>
      </div>

      {/* Text Section */}
      <p className="text-center text-3xl p-4 font-bold  mt-6 max-w-2xl">
        המערכת שמחברת ספקים ולקוחות בממשק ידידותי, חוסכת זמן, ומביאה את העסק שלך קדימה.
      </p>
    </div>
  );
}
