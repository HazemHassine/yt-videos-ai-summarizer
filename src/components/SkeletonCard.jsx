import React from 'react'

function SkeletonCard() {
    return (
      <div className="inner-border-2 inner-border-solid inner-border-black bg-white relative flex flex-col py-4 px-5 w-1/3 max-w-lg drop-shadow-lg transition-all duration-300">
        <div className="h-8 w-8 absolute top-0 left-0 z-[55]">
          <div className="absolute h-8 w-8 bg-white top-0 left-0 z-[55] border-t-4 border-t-white border-l-white border-l-4 border-r-2 border-r-black border-b-2 border-b-black">
            <div className="absolute inset-0 bg-transparent">
              <div className="bg-black h-[43px] w-[2px] rotate-45 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 bg-gray-300 rounded w-1/2 animate-pulse" />
          <div className="h-16 w-16 bg-gray-300 rounded-lg animate-pulse" />
        </div>
        <div className="h-24 bg-gray-300 rounded mb-4 animate-pulse" />
        <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse" />
        <div className="flex items-center gap-2 mt-3">
          <div className="h-10 w-24 bg-gray-300 rounded animate-pulse" />
          <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse" />
          <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }
  

export default SkeletonCard;